var board = null
var game = new Chess()
var streak_val = 0
var $streak = $('#streak')
var $status = $('#status')
var $stm = $('#stm')
var $commentary = $('#commentary')
var $fen = $('#fen')
var $elo = $('#elo')
var $fen_string = $('#fen_string')
var $cp_string = $('#cp_string')
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
var level_val = 0
var $level = $('#level')
var $score = $('#score')
var score_e = ''
var score_m = ''  
var score_h = ''  
var score_board = ''
var easy_score = 0
var easy_total = 0
var medium_score = 0
var medium_total = 0
var hard_score = 0
var hard_total = 0
var $resultIcon = $('#resultIcon')
var result_str = ''
var elo_str = ''
var elo_white = 0
var elo_black = 0
var fen_str = ''
var co_str = ''

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
	
	//XM: update result icon (green check or red strike)
	if ((streak_val === 0) && (easy_total + medium_total + hard_total > 0))
		result_str = "<img src=\"img/incorrect.png\" style=\"width:35px;height:35px;margin:0 auto;\">";
	else if (streak_val > 0)
		result_str = "<img src=\"img/correct.png\" style=\"width:35px;height:35px;margin:0 auto;\">";
	$resultIcon.html(result_str);
	
	//XM: update advantage bar
	updateAdvantage ((black_wdl*100).toFixed(2));
		
	//XM: update scores
	score_e = "<span style=\"color:green\">" + easy_score + "/" + easy_total + "E  " + "</span>";
	score_m = "<span style=\"color:blue\">" + medium_score + "/" + medium_total + "M  " + "</span>";
	score_h = "<span style=\"color:black\">" + hard_score + "/" + hard_total + "H  " + "</span>";
    $streak.html(score_e + score_m + score_h);
	//$streak.html("<span style=\"color:#eeff00\">"+1+"</span>");
	
	//XM: update current level
	if (level_val === 0) 
    	$level.html('Easy')
		else if (level_val === 1)
			$level.html('Medium')
			else $level.html('Hard')
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
				if (level_val === 0) 
			    	easy_score +=1; 
					else if (level_val === 1)
						medium_score += 1;
						else hard_score += 1;
            }
            else {
                streak_val = 0;
            }
            updateStatus();
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
				if (level_val === 0) 
			    	easy_score +=1; 
					else if (level_val === 1)
						medium_score += 1;
						else hard_score += 1;
            }
            else {
                streak_val = 0;
            }
            //$streak.html(streak_val)
			updateStatus();
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
				if (level_val === 0) 
			    	easy_score +=1; 
					else if (level_val === 1)
						medium_score += 1;
						else hard_score += 1;
            }
            else {
                streak_val = 0;
            }
            //$streak.html(streak_val)
			updateStatus();
        })
        .fail(function(err) {
          console.log("failure equal button");
      });
    });

	//XM added unified "next" button to generate new board position according to current difficulty level
    $('#NextButton').on('click', function() {
		if (level_val === 0) {
	    	level_str = {'difficulty': 'E'};
			easy_total += 1;
			}
			else if (level_val === 1) {
				level_str = {'difficulty': 'M'};
				medium_total += 1;
			}
			else {
				level_str = {'difficulty': 'H'};
				hard_total += 1;
			}
			
        $.ajax({
          url: 'http://127.0.0.1:8000/boardupdate',
          type: 'GET',
          contentType: 'application/json',
          datatype: 'json',
          //data: JSON.stringify(data_to_send)
          data: level_str
        })
		
        .done(function(data) {
		  console.log('Success in adding fen at: ', level_str)
          const json_string = JSON.stringify(data)
          const json_obj = JSON.parse(json_string)
          board.position(json_obj.fen)
          $fen.html(json_obj.fen)
		  fen_str = json_obj.fen;
          $whiteELO.html(json_obj.WhiteELO)
          $blackELO.html(json_obj.BlackELO)
		  elo_white = json_obj.WhiteELO;
		  elo_black = json_obj.BlackELO;
  
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
		  
		  clearCurrentResult();
		  resetAdvantage();
        })
        .fail(function(err) {
          console.log('failure in adding fen')
        })			
    })

    // NEW BOARD POSITION Buttons

    $('#EasyButton').on('click', function() {
        data_E = {'difficulty': 'E'};
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
//$('#NextButton').button();
  
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

/* XM added toggle actions for level selection drop-down menu */
function setLevel(level) {
	level_val = level;
	updateStatus();
}

/* XM added for advantage progress bar refresh */
function updateAdvantage(x) {
    var elem = document.getElementById("myBar");
    //elem.style.background-color = #FF0000;
    elem.style.width = x + "%";
	if (easy_total + medium_total + hard_total > 0)	
		elem.innerHTML = x + "%";
	else elem.innerHTML = "";
}

function resetAdvantage() {
    var elem = document.getElementById("myBar");
    elem.style.width = 0 + "%";
	elem.innerHTML = "";
}


/* XM added for advantage progress bar refresh */
function clearCurrentResult() {
	// clear check/strke
	result_str = "";
	$resultIcon.html(result_str);
	
	//XM: reset advantage bar
	resetAdvantage();
}

/* XM added for hamburger menu */
/* Toggle between showing and hiding the navigation menu links when the user clicks on the hamburger menu / bar icon */
function myFunction() {
  var x = document.getElementById("myLinks");
  if (x.style.display === "inline") {
    x.style.display = "none";
  } else {
    x.style.display = "inline";
  }
}

const hamburger = document.querySelector(".hamburger");
hamburger.addEventListener("click", function () {
  this.classList.toggle("close");
});

/* XM added pop-up window displaying position info from drop-down menu */
function popInfo() {
	//XM: update ELO numbers
	elo_str = elo_white + " (White), " + elo_black + " (Black)";
    $elo.html(elo_str);
	
	// update fen string
	$fen_string.html(fen_str);
	
	// update CP string
	cp_str = white_cp + " (White), " + black_cp + " (Black)";
	$cp_string.html(cp_str);
}

