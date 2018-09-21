var simon = {
  init: function() {
    this.count = 1; // player move count
    this.round = 1; // game round
    this.sequence = [];
    this.player_move = null;
    this.player_turn = false;
  },
  count: 1,
  round: 1,
  strict: false,
  power_on: false,
  player_turn: false,
  sequence: [],
  nextSequence: function() {
    return this.sequence.slice(0, this.round + 1);
  },
  currentSequence: function() {
    return this.sequence.slice(0, this.round);
  },
  player_sequence: [],
  current_move: null,
  player_move: null,
  keypress: 0,
  error: false,
  mapFeedback: function(num) {
    var sound, light;

    switch (num) {
      case 1: // Green
        sound = new Audio ('sounds/1_green.mp3'),
        light = $("#btn_green").css("opacity", "1");
        if (simon.player_turn) { simon.player_move = 1; }
        if (!simon.player_turn) { simon.current_move = 1; }
        break;
      case 2: // Red
        sound = new Audio ('sounds/2_red.mp3'),
        light = $("#btn_red").css("opacity", "1");
        if (simon.player_turn) { simon.player_move = 2; }
        if (!simon.player_turn) { simon.current_move = 2; }
        break;
      case 3: // Yellow
        sound = new Audio ('sounds/3_yellow.mp3'),
        light = $("#btn_yellow").css("opacity", "1");
        if (simon.player_turn) { simon.player_move = 3; }
        if (!simon.player_turn) { simon.current_move = 3; }
        break;
      case 4: // Blue
        sound = new Audio ('sounds/4_blue.mp3'),
        light = $("#btn_blue").css("opacity", "1");
        if (simon.player_turn) { simon.player_move = 4; }
        if (!simon.player_turn) { simon.current_move = 4; }
        break;
    }

    renderFeedback(sound, light);
  }
}

// Timers
var playAlertID,
    playCurrentSequenceID;

simon.init(); // Start game

// Power off/on button
$("label.switch input").on("click", function() {
  if (simon.power_on === false) {
    simon.power_on = true;
    $("h2").css("color", "rgb(242,72,72)");

    // Turn on Start/Strict buttons
    $("#btn_start, #btn_strict")
    .prop("disabled", false).css("cursor", "pointer");
    console.log('power on');

  } else {
    simon.power_on = false;
    $("h2").css("color", "rgb(90,25,25)");

    // Turn off buttons and behavior
    $("#btn_start, #btn_strict, .btn_gameplay")
    .prop("disabled", true).css("cursor", "default");
    $("h2").text("--");
    $(".strict_indicator").removeClass("red_indicator");

    clearTimeout(playAlertID);
    clearTimeout(playCurrentSequenceID);

    console.log('power off');
  }
})

// Start/strict event handlers
$("#btn_start").on("click", function() { startGame(); });
$("#btn_strict").on("click", function() {
  simon.strict = !simon.strict;
  $(".strict_indicator").toggleClass("red_indicator");
});

// Capture player move, update board, and check input
$(".btn_gameplay").on("click", function() {
  simon.player_move = parseInt(this.value);

  // playTimer();
  checkMove();
});

// Colored buttons UI availability
function toggleButtons() {
  if (simon.player_turn) {
    $(".btn_gameplay").prop("disabled", false).css("cursor", "pointer");
  } else {
    $(".btn_gameplay").prop("disabled", true).css("cursor", "default");
    $(".btn_gameplay").off("click");
  }
}

function startGame() {
  simon.init();
  alert("--");
  createSequence();
  setTimeout(playSequence, 1000, [simon.sequence[0]]);
}

function createSequence() {
  simon.sequence = [];
  for (var i = 0; i < 20; i++) {
    simon.sequence.push(Math.ceil(Math.random() * (4)));
  }
}

// Iterates over sequence array and plays individual element
function playSequence(sequence) {

  simon.player_turn = false;
  $("h2").text(simon.round);
  for (let i = 0; i < sequence.length; i++) {
    setTimeout(function() {
      simon.mapFeedback(sequence[i]);

      // When length is met queue player turn and start timer
      if (i === sequence.length - 1) {
        setTimeout(function() {
          takeTurn();
        }, 1500);
      }
    }, i * 1000); // increase time with each round
  }
}

function renderFeedback(sound, light) {

  // If no error play sound (otherwise error buzz plays)
  if (!simon.error) {
    sound.play();
  }
  light;
  setTimeout(function() {
    light.css("opacity", ".5");
  }, 250, light);
}

function takeTurn() {
  simon.player_turn = true;
  toggleButtons();
  // playTimer();  // Starts timer input or not
}

// Alerts and resets game if player times out
// TODO: Get this function working!
// function playTimer() {
//
//   playAlertID = setTimeout(function() {
//     alert('!!', 'buzz');
//     console.log('timeout!')
//
//     // Replays current sequence
//     playCurrentSequenceID = setTimeout(playSequence, 1000, simon.currentSequence());
//
//     // If input entered clear timer
//     if (simon.player_move !== null) {
//       console.log('player moved')
//
//       clearTimeout(playAlertID);
//       clearTimeout(playCurrentSequenceID);
//     }
//   }, 3000);
// }

function alert(text, sound) {
  var win, buzz;

  // Blink text and display current round
  $("h2").text(text).fadeOut(250).fadeIn(250).fadeOut(250).fadeIn(250);

  if (sound === 'win') {
    // Courtesy https://freesound.org/s/342218/
    win = new Audio ('sounds/win.mp3'),
    setTimeout(function() {
      win.play();
    }, 500);
    setTimeout(startGame, 3500);
  } else if (sound === 'buzz') {
    // Courtesy RICHERlandTV, freesound.org
    // https://freesound.org/s/216090/
    // https://creativecommons.org/licenses/by/3.0/
    // Changed filename from:
    // 216090__richerlandtv__bad-beep-incorrect
    buzz = new Audio ('sounds/buzz.mp3'),
    buzz.play();
  }
}

function checkMove() {

  // Check if player move matches the current sequence
  if (simon.player_move === simon.currentSequence()[simon.count - 1]) {

    clearTimeout(playAlertID);
    clearTimeout(playCurrentSequenceID);

    // Generate player sequence array from player moves
    simon.player_sequence[simon.count - 1] = simon.player_move;

    simon.mapFeedback(simon.player_move);

    // Advance sequence when last match is made
    if (simon.count === simon.currentSequence().length) {
      simon.count = 1; // Check at beginning on next round

      // Game not won - play next sequence
      if (simon.round !== 9) {
        setTimeout(playSequence, 1000, simon.nextSequence());
        simon.player_move = null;

      // Game won - alert victory and restart
    } else if (simon.round === 9)  {
        alert('**', 'win');
        simon.init();
      }

      simon.round++;

    // Keep checking sequence until last match
    } else {
      simon.count++;
      // playTimer();
    }

  // If player move doesn't match current sequence
  } else {
    simon.error = true;
    simon.mapFeedback(simon.player_move);
    simon.error = false;
    alert('!!', 'buzz');
    simon.player_move = null;
    simon.count = 1;
    playCurrentSequenceID = setTimeout(playSequence, 1000, simon.currentSequence());

    // Start over again in non-strict mode
    if (simon.strict) {
      clearTimeout(playCurrentSequenceID);
      setTimeout(startGame, 1300);
    }
  }
}


// TODO Limit keypresses to number of rounds
  // simon.keypress++;
  // if (simon.keypress > simon.round) {
  //   $(".btn_gameplay").prop("disabled", true).css("cursor", "default");
  //   $(".btn_gameplay").off("click");
  //   console.log('lay off da keys!');
  // }

// TODO

// NOTE
// Clear all timeouts strategy (create simon.timeouts array)

// simon.timeouts.push(playAlertID, playCurrentSequenceID);

// function clearAllTimeouts() {
//   console.log('simon.timeouts ', simon.timeouts);
//   for (var i = 0; i < simon.timeouts.length; i++) {
//     clearTimeout(simon.timeouts[i]);
//   }
//   simon.timeouts = [];
// }
