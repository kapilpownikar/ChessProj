import chess
import chess.pgn
import chess.engine
from chess.engine import Cp, Mate, MateGiven
import csv

import pandas as pd
import math

import sys
import glob
import os

engine = chess.engine.SimpleEngine.popen_uci(r"C:\Users\Kapil Pownikar\Desktop\QCRI Folder\Stockfish Engine Terminal\stockfish_15_x64_avx2.exe")
analysis_limit = chess.engine.Limit(depth = 15)
# increasing threads has reduced process time significantly
engine.configure({'Threads': 1})
engine.configure({'Hash': 64})

# global set used for managing duplicate fens
distinct_fens = set()

def board_analyze(board, ply_val):
    with engine.analysis(board, limit=analysis_limit) as analysis:
        for info in analysis:
            eng_score = info.get("score")
        # Currently the most time-consuming component due to engine analysis
        if eng_score is not None:
            cp_w = eng_score.white().score()
            cp_b = 0
            if cp_w is None:
                cp_b = None
            else:
                cp_b = -cp_w
            wdl_w = eng_score.wdl(ply=ply_val).pov(chess.WHITE).expectation()
            wdl_b = 1 - wdl_w
    return cp_w, cp_b, wdl_w, wdl_b

# a wdl difference of 0.05 currently considered fairly equal for both sides
def adv(diff):
    adv_str = 'White'
    if diff > -0.05 and diff < 0.05:
        adv_str = 'Equal'
    elif diff < 0.00:
        adv_str = 'Black'
    return adv_str

def cpadv(cpdiff):
    winning = 'White'
    if cpdiff < 0.0:
        winning = 'Black'
    elif cpdiff == 0.0:
        winning = 'Equal'
    return winning

def player_turn(board):
    turn = ["B","W"][board.turn]
    return turn

def level_select(WdlDiff):
    diff_mod = abs(float(WdlDiff))
    level = ""
    if diff_mod < 0.2:
        level = "Hard"
    elif diff_mod < 0.4:
        level = "Medium"
    else:
        level = "Easy"
    
    return level

# EFFECTS: Returns a list of df rows(as lists) for every game per pgn file
# Inner list contains row content, outer list contains all such rows
def update_database(filename):
    # here, midgame-endgame is defined to be: 
    # either after move 10 or when either player castles
    pgn = open(filename)
    # a list of lists
    list_row = []
    while True:
        game = chess.pgn.read_game(pgn)
        if game is None:
            break
        white_elo = game.headers['WhiteElo']
        black_elo = game.headers['BlackElo']
        curr_board = game.board()
        
        # ply tracks the half-move count: used in improving wdl accuracy
        ply = 0.0
        for move in game.mainline_moves():
            curr_board.push(move)
            ply += 1
            if ply > 20 or (not curr_board.has_castling_rights(chess.WHITE) and not curr_board.has_castling_rights(chess.BLACK)):
                fen = curr_board.fen()
                if fen not in distinct_fens:
                    count = math.ceil(ply / 2)
                    row = [fen,white_elo,black_elo,ply,count]
                    list_row.append(row)
                    distinct_fens.add(fen)
    return list_row

# EFFECTS: processes a dataframe of board states and returns the final 
#           dataframe with required columns
def processing(db):
    
    main_cols = ['FEN','White ELO','Black ELO','STM','Move no',
                 'White cp','Black cp','CpAdv',
                 'White wdl','Black wdl','WdlDiff','WdlAdv','Level']
    
    lst_temp = []
    # calculating info for each boardstate
    for index, row in db.iterrows():
        fen = row['FEN']; white_elo = row['White ELO']; black_elo = row['Black ELO']
        ply = row['Ply']; num_move = row['Move count']
        board = chess.Board(fen, chess960=False)
        stm = player_turn(board)
        centi_w, centi_b, wdl_w , wdl_b = board_analyze(board,ply)
        diff = wdl_w - wdl_b
        level = level_select(diff)
        # Catching Exception
        if centi_w is None or centi_b is None:
            cpdiff = 0.0
        else:
            cpdiff = centi_w - centi_b
        adv_wdl = adv(diff); adv_cp = cpadv(cpdiff)
        
        new_row = [fen,white_elo,black_elo,stm,num_move,
                   centi_w,centi_b, adv_cp,
                   wdl_w,wdl_b,diff,adv_wdl,level]
        lst_temp.append(new_row)
    
    main_df = pd.DataFrame(lst_temp, columns=main_cols)
    return main_df

def main():
    
    # Terminal Usage: python <script name> "Directory Path" "csv file path"
    try:
        dir_path = sys.argv[1]
        csv_file = sys.argv[2]
    except IndexError:
        raise SystemExit(f"Usage: {sys.argv[0]} <pgn filenames>")
    
    # populating distinct_fens set with existing fen values in main database
    with open(csv_file) as f_csv:
        read_f = csv.reader(f_csv)
        for row in read_f:
            distinct_fens.add(row[1])
    
    # Creates Dataframe with unqiue Boardstates
    df_col = ['FEN','White ELO','Black ELO','Ply','Move count']
    lst_main = []
    path = dir_path + '\*.pgn'
    
    # Glob usage for directories
    files = glob.glob(path)
    for f in files:
        curr_list = update_database(f)
        lst_main.extend(curr_list)
    
    df_comb = pd.DataFrame(lst_main, columns=df_col)
    print('Onward to processing')
    df_main = processing(df_comb)
    df_main.to_csv(csv_file,mode='a', encoding='utf-8')
    
    print('Finished copying to csv')
        
if __name__ == "__main__":
    main()