# QCRI Chess Project
//- Dr. Ting Yu, Dr. Xiaosong Ma, Dr. Saravanan Thirumuruganathan
//- Project Assistant: Kapil Pownikar

Interactive Quiz-type Web Application that displays board states from recorded past chess games and prompts the user to guess the side with the current advantage.

File structure breakdown:

1. database_gen.py - Receives a directory of .pgn files (Portable Game Notation) containing multiple games and utilizes stockfish to analyze and record interesting board states throughout the games. Outputs statistics for the boardstates into a .csv file (Requires anywhere from 20-24 hours to parse through 800+ games)

  Note: Output can also be redirected to another format supported by pandas dataframe conversion.

2. backend.py - Flask app that selects a randomized boardstate from given database based on user-selected criteria [Easy] / [Med] / [Hard] as well as communicating the outcome results to the front-end (either correct/wrong choice chosen by the user) as well as statistics of that boardstate in detail.

3. testscript.js - front-end component with button-functionality (jquery ajax) as well as updating variables as the game progresses <br/>
    Contains: - Chessboard.js object with game functionality, <br/>
              - Updates on game statistics per puzzle <br/>
              - Button behavior <br/>

4. gridstyle.css - CSS grid with attributes for the components of the page defined. <br/>
                  - Defines page layout, button and text layout + positioning and size of chessboard <br/>
                  - Background and color of board + grid also defined <br/>

5. datadifficulty.csv - .csv format database of boardstates used for puzzles. <br/>
 Note: This file is updated each time database_gen.py is run on new directories of .pgn files
