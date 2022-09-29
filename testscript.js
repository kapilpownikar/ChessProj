var board = null
var game = new Chess()
var streak_val = 0
var $streak = $('#streak')
var $status = $('#status')
var $stm = $('#stm')
var $commentary = $('#commentary')
var $fen = $('#fen')
var $whiteELO = $('#whiteELO')
var $blackELO = $('#blackELO')
var $whiteWDL = $('#whiteWDL')
var $blackWDL = $('#blackWDL')
var $whiteCP = $('#whiteCP')
var $blackCP = $('#blackCP')
var side_move = ''
var white_wdl = 0
var black_wdl = 0
var white_cp = 0
var black_cp = 0

function onDragStart (source, piece, position, orientation) {
    // do not pick up pieces if the game is over
    if (game.game_over()) return false
  
    // only pick up pieces for the side to move
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
      return false
    }
  }
  
  function onDrop (source, target) {
    // see if the move is legal
    var move = game.move({
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a queen for example simplicity
    })
  
    // illegal move
    if (move === null) return 'snapback'
    updateStatus()
  }
  
  // update the board position after the piece snap
  // for castling, en passant, pawn promotion
  function onSnapEnd () {
    board.position(game.fen())
  }
  
  function updateStatus () {
    var status = ''
  
    var moveColor = 'White'
    if (game.turn() === 'b') {
      moveColor = 'Black'
    }
  
    // checkmate?
    if (game.in_checkmate()) {
      status = 'Game over, ' + moveColor + ' is in checkmate.'
    }
  
    // draw?
    else if (game.in_draw()) {
      status = 'Game over, drawn position'
    }
  
    // game still on
    else {
      status = moveColor + ' to move'
  
      // check?
      if (game.in_check()) {
        status += ', ' + moveColor + ' is in check'
      }
    }
  
    $status.html(status)
    $stm.html(side_move)
    $fen.html(game.fen())
    $streak.html(streak_val)
  }

// Button functionalities

$(document).ready(function(){

    $('#WhiteButton').on('click', function() {
        data_to_send = {'UserChoice': 'White'}
        $.ajax({
            url: 'http://127.0.0.1:8000/updatechoice',
            type: 'GET',
            contentType: 'application/json',
            datatype: 'json',
            //data: JSON.stringify(data_to_send)
            data: data_to_send
        })
        .done(function(data) {
            console.log("success ", data);
            $commentary.html(data);
            $blackWDL.html(black_wdl);
            $whiteWDL.html(white_wdl);
            $blackCP.html(black_cp);
            $whiteCP.html(white_cp);
            if (data === 'User has guessed correctly!'){
                streak_val += 1;
            }
            else {
                streak_val = 0;
            }
            $streak.html(streak_val)
        })
        .fail(function(err) {
          console.log("failure white button");
      });
    });
    $('#BlackButton').on('click', function() {
        data_to_send = {'UserChoice': 'Black'}
        $.ajax({
            url: 'http://127.0.0.1:8000/updatechoice',
            type: 'GET',
            contentType: 'application/json',
            datatype: 'json',
            //data: JSON.stringify(data_to_send)
            data: data_to_send
        })
        .done(function(data) {
            console.log("success ", data);
            $commentary.html(data);
            $blackWDL.html(black_wdl);
            $whiteWDL.html(white_wdl);
            $blackCP.html(black_cp);
            $whiteCP.html(white_cp);
            if (data === 'User has guessed correctly!'){
                streak_val += 1;
            }
            else {
                streak_val = 0;
            }
            $streak.html(streak_val)
        })
        .fail(function(err) {
          console.log("failure black button");
      });
    });
    $('#EqualButton').on('click', function() {
        data_to_send = {'UserChoice': 'Equal'}
        $.ajax({
            url: 'http://127.0.0.1:8000/updatechoice',
            type: 'GET',
            contentType: 'application/json',
            datatype: 'json',
            //data: JSON.stringify(data_to_send)
            data: data_to_send
        })
        .done(function(data) {
            console.log("success ", data);
            $commentary.html(data);
            $blackWDL.html(black_wdl);
            $whiteWDL.html(white_wdl);
            $blackCP.html(black_cp);
            $whiteCP.html(white_cp);
            if (data === 'User has guessed correctly!'){
                streak_val += 1;
            }
            else {
                streak_val = 0;
            }
            $streak.html(streak_val)
        })
        .fail(function(err) {
          console.log("failure equal button");
      });
    });

    // NEW BOARD POSITION Buttons

    $('#EasyButton').on('click', function() {
        data_E = {'difficulty': 'E'}
        $.ajax({
          url: 'http://127.0.0.1:8000/boardupdate',
          type: 'GET',
          contentType: 'application/json',
          datatype: 'json',
          //data: JSON.stringify(data_to_send)
          data: data_E
        })
        .done(function(data) {
          console.log('Success in adding easy fen')
          const json_string = JSON.stringify(data)
          const json_obj = JSON.parse(json_string)
          board.position(json_obj.fen)
          $fen.html(json_obj.fen)
          $whiteELO.html(json_obj.WhiteELO)
          $blackELO.html(json_obj.BlackELO)
          
          black_wdl = json_obj.blackWDL
          white_wdl = json_obj.whiteWDL
          black_cp = json_obj.blackCP
          white_cp = json_obj.whiteCP
          side_move = json_obj.side
          $commentary.html('');            
          $blackWDL.html('');
          $whiteWDL.html('');
          $blackCP.html('');
          $whiteCP.html('');
        })
        .fail(function(err) {
          console.log('failure in adding easy fen')
        })
    })
    $('#MediumButton').on('click', function() {
        data_M = {'difficulty': 'M'}
        $.ajax({
          url: 'http://127.0.0.1:8000/boardupdate',
          type: 'GET',
          contentType: 'application/json',
          datatype: 'json',
          //data: JSON.stringify(data_to_send)
          data: data_M
        })
        .done(function(data) {
          console.log('Success in adding medium fen')
          const json_string = JSON.stringify(data)
          const json_obj = JSON.parse(json_string)
          board.position(json_obj.fen)
          $fen.html(json_obj.fen)
          $whiteELO.html(json_obj.WhiteELO)
          $blackELO.html(json_obj.BlackELO)
          
          black_wdl = json_obj.blackWDL
          white_wdl = json_obj.whiteWDL
          black_cp = json_obj.blackCP
          white_cp = json_obj.whiteCP
          side_move = json_obj.side
          
          $commentary.html('')            
          $blackWDL.html('');
          $whiteWDL.html('');
          $blackCP.html('');
          $whiteCP.html('');
        })
        .fail(function(err) {
          console.log('failure in adding medium fen')
        })
    })
    $('#HardButton').on('click', function() {
        data_H = {'difficulty': 'H'}
        $.ajax({
          url: 'http://127.0.0.1:8000/boardupdate',
          type: 'GET',
          contentType: 'application/json',
          datatype: 'json',
          //data: JSON.stringify(data_to_send)
          data: data_H
        })
        .done(function(data) {
          console.log('Success in adding hard fen')
          const json_string = JSON.stringify(data)
          const json_obj = JSON.parse(json_string)
          board.position(json_obj.fen)
          $fen.html(json_obj.fen)
          $whiteELO.html(json_obj.WhiteELO)
          $blackELO.html(json_obj.BlackELO)
          
          black_wdl = json_obj.blackWDL
          white_wdl = json_obj.whiteWDL
          black_cp = json_obj.blackCP
          white_cp = json_obj.whiteCP
          side_move = json_obj.side

          $commentary.html('')
          $blackWDL.html('');
          $whiteWDL.html('');
          $blackCP.html('');
          $whiteCP.html('');
        })
        .fail(function(err) {
          console.log('failure in adding hard fen')
        })
    })

});

$('#WhiteButton').button();
$('#BlackButton').button();
$('#EqualButton').button(); 
$('#EasyButton').button();
$('#MediumButton').button();
$('#HardButton').button();
  
var config = {
draggable: true,
position: 'start',
onDragStart: onDragStart,
onDrop: onDrop,
onSnapEnd: onSnapEnd
}
  
$streak.html(0);
board = Chessboard('quizboard', config);
$(window).resize(board.resize);
updateStatus();


