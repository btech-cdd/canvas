(async function () {
  let pageType = "";
  let buttonRef = "";
  if (location.pathname.includes("\/pages\/")) {
    pageType = "page";
    buttonRef = ".buttons";
  }
  if (location.pathname.includes("\/assignments\/")) {
    pageType = "assignment";
    buttonRef = ".assignment-buttons";
  }
  if (location.pathname.includes("\/quizzes\/") && location.pathname.includes("\/take")) {
    pageType = "quizzes";
    $(".quiz-header h3").after('<div class="buttons"></div>');
    buttonRef = ".quiz-header .buttons";
  }
  if (pageType == "") return;
  if (pageType == "quizzes") {
    let questions = $(".display_question");
    questions.each(function () {
      let question = $(this);
      let playButton = $('<div href="#" style="float: right; padding-left: .5rem; cursor: pointer;"><i class="icon-audio"></i></div>');
      playButton.click(function () {
        let els = question.find('.text').children();
        speechSynthesis.cancel();
        setCurrentEl($(els[0]));
        play();
      });
      question.find('.header .question_name').after(playButton);
    });
  }
  speechSynthesis.cancel(); //clear from existing utterances
  speechSynthesis.pause(); //pause so it doesn't start off playing.
  var isPaused = true; //speechSynthesis paused property doesn't work. Using custom variable until it does work.
  var currentEl; //track current el
  var bgColor; //this is the original background color of the element being played. Keep track to reset it after done playing or paused.
  var playingColor = "#00CCFF"; //a little bright atm, but this is the color a el gets highlighted in if it is playing.

  function reset() {
    let els = $(".user_content").children();
    setCurrentEl($(els[0]));
  }

  function play() {
    speechSynthesis.resume();
    currentEl.css('background-color', playingColor);
    isPaused = false;
  }

  function pause() {
    speechSynthesis.pause();
    currentEl.css('background-color', bgColor);
    isPaused = true;
  }

  function setCurrentEl(el) {
    //reset old current el
    if (currentEl != undefined) {
      currentEl.css('background-color', bgColor);
    }
    //update current el to new current el
    currentEl = el;
    //update bg color
    bgColor = currentEl.css('background-color');
    if (!isPaused) {
      currentEl.css('background-color', playingColor);
    }

    //once the currentEl is set, start playing it. Currently appears that there is no case where you would set and not process. Adjust if this changes.
    processCurrentEl(currentEl);
  }
  //restarts the clock for chrome's 15 second timeout. If not, the whole thing will stop working after 15 seconds of being paused.
  //can be set as high as 14000, currently have less just to be safe.
  var synthesisInterval = setInterval(() => {
    if (isPaused) {
      speechSynthesis.resume();
      speechSynthesis.pause();
    }
  }, 10000);
  var currentSpeak;
  async function nextLine(line) {
    var speak = new SpeechSynthesisUtterance();
    currentSpeak = speak;
    speak.text = line;
    speak.volume = 1;
    speak.rate = 1;
    speak.pitch = 1;
    //May eventually set up an option to change this. If so, should save it through the Canvas custom data endpoint.
    speak.voiceURI = "Alex";
    speak.lang = "en-US";

    //just for safe keeping, but haven't ever seen it fire.
    speak.onerror = function () {
      console.log("onerror");
    };

    //init speaking
    speechSynthesis.speak(speak);

    //if this isn't done, then the interval above will start playing each line every <interval value> seconds.
    speak.onstart = function (e) {
      if (isPaused) {
        speechSynthesis.resume();
        speechSynthesis.pause();
      }
    }

    //set up as a promise so can await before starting the next line
    return new Promise(resolve => {
      speak.onend = function () {
        resolve();
      };
    });
  }

  async function processCurrentEl() {
    var el = currentEl;
    let text = el.text();
    var lines = text.match(/([^\.!\?\n]+[\.!\?\n]+)|([^\.!\?\n]+$)/g);
    if (!isPaused) {
      el.css('background-color', playingColor);
    }

    if (lines !== null && el.is(":visible")) {
      for (let l = 0; l < lines.length; l++) {
        let line = lines[l].trim();
        if (line !== "") {
          await nextLine(line);
        }
      }
    }

    //this fires when the el is canceled when skipping forward/back, so need to check to make sure this el is still the current el.
    if (currentEl == el) {
      //make sure there is a next el before jumping
      if (currentEl.next().length > 0) {
        setCurrentEl($(currentEl.next()));
      } else {
        reset();
        pause();
      }
    }
  }

  //set up the controls
  let playButton = $('<a class="btn" href="#" onclick="return;"><i class="icon-audio"></i></a>');
  playButton.click(function () {
    if (isPaused) {
      play();
    } else {
      pause();
    }
  });
  let prevButton = $('<a class="btn" href="#" onclick="return;"><i class="icon-arrow-left"></i></a>');
  prevButton.click(function () {
    if (!isPaused) {
      speechSynthesis.cancel();
      //make sure there is a previous el before jumping
      if (currentEl.prev().length > 0) {
        setCurrentEl($(currentEl.prev()));
      }
    }
  });
  let nextButton = $('<a class="btn" href="#" onclick="return;"><i class="icon-arrow-right""></i></a>');
  nextButton.click(function () {
    if (!isPaused) {
      speechSynthesis.cancel();
      //make sure there is a next el before jumping
      if (currentEl.next().length > 0) {
        setCurrentEl($(currentEl.next()));
      }
    }
  });
  //I don't think this is necessary atm. Cand add it in if that changes. Also uncomment where it gets added to the controls.
  //let restart = $('<a class="btn" href="#"><i class="icon-refresh""></i></a>');
  $(buttonRef).prepend(nextButton);
  $(buttonRef).prepend(playButton);
  $(buttonRef).prepend(prevButton);

  $('body').append(readerControls);

  reset();
})();