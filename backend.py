import csv
import string
import chess
import chess.pgn
import random
import json
from random import randint
import pandas as pd

# Flask and WSGI
import flask
from flask import Flask, Blueprint, jsonify
from flask import request
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)

# Reading database
db = pd.read_csv('datadifficulty.csv')

# divided by difficulty
db_easy = db.loc[db['Level'] == 'Easy']
db_easy.reset_index(inplace=True, drop=True)
db_medium = db.loc[db['Level'] == 'Medium']
db_medium.reset_index(inplace=True, drop=True)
db_hard = db.loc[db['Level'] == 'Hard']
db_hard.reset_index(inplace=True, drop=True)

# Globals that track current answers
curr_fen = ''
white_elo = 0; black_elo= 0
white_cp = 0; black_cp = 0
white_wdl = 0.00; black_wdl = 0.00
ans_cpadv = ''; ans_wdladv = ''

@app.route('/',methods=['GET', 'POST'])
@cross_origin()
def blank_text():
    return "Blank"

# Extracts a random fen from database and sets globals accordingly
@app.route('/boardupdate', methods=['GET','POST'])
@cross_origin()
def board_update():
    global curr_fen, white_elo, black_elo, white_cp, black_cp, white_wdl, black_wdl, ans_cpadv, ans_wdladv
    #for testing
    diff_v = request.args.get('difficulty')
    dbr = pd.DataFrame()
    # matching database
    if diff_v == 'E':
        dbr = db_easy
    elif diff_v == 'M':
        dbr = db_medium
    elif diff_v == 'H':
        dbr = db_hard
    else:
        dbr = db
    fen_row = random.randint(0,len(dbr))
    curr_fen = dbr.loc[fen_row,'FEN']
    white_elo = dbr.loc[fen_row,'White ELO']; black_elo = dbr.loc[fen_row,'Black ELO']
    white_cp = dbr.loc[fen_row,'White cp']; black_cp = dbr.loc[fen_row,'Black cp']
    white_wdl = dbr.loc[fen_row,'White wdl']; black_wdl = dbr.loc[fen_row, 'Black wdl']
    ans_cpadv = dbr.loc[fen_row,'CpAdv']; ans_wdladv = dbr.loc[fen_row,'WdlAdv']
    print(ans_cpadv, ans_wdladv)
    
    dict_send = {'fen': curr_fen,
                'WhiteELO': str(white_elo),
                'BlackELO': str(black_elo)}
    return jsonify(dict_send)

@app.route('/updatechoice', methods=['GET','POST'])
@cross_origin()
def update_choice():
    choice = request.args.get('UserChoice')
    print('this is the choice', choice)
    comments = ''
    print(ans_cpadv,ans_wdladv)
    if (choice == ans_cpadv) or (choice == ans_wdladv):
        comments = 'User has guessed correctly!'
    else:
        comments = 'User has guessed wrong.' + ' Correct Answer is ' + ans_wdladv
    print(comments)
    return comments

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000, debug=True)
