// questions array
const quizQuestionsData = [
  {
    question: 'What data type does the JavaScript function confirm() return?',
    answers: [
      { answer: 'String', id: 1 },
      { answer: 'Number', id: 2 },
      { answer: 'Boolean', id: 3 },
      { answer: 'undefined', id: 4 },
    ],
    correctId: 3
  },
  {
    question: 'Which of the following can you use to determine the type of a variable?',
    answers: [
      { answer: 'getType(var)', id: 1 },
      { answer: 'typeof var', id: 2 },
      { answer: 'var.type()', id: 3 },
      { answer: 'var.className', id: 4 },
    ],
    correctId: 2
  },
  {
    question: 'Which of the following is <strong><em>not</em></strong> a valid JavaScript function declaration?',
    answers: [
      { answer: 'function myFunc() {...}', id: 1 },
      { answer: 'var myFunc = function() {...}', id: 2 },
      { answer: 'function myFunc = {...}', id: 3 },
      { answer: 'const myFunc = () => {...}', id: 4 },
    ],
    correctId: 3
  },
  {
    question: 'How can you output messages to the console?',
    answers: [
      { answer: 'console.print(msg)', id: 1 },
      { answer: 'echo msg', id: 2 },
      { answer: 'msg.console()', id: 3 },
      { answer: 'console.log(msg)', id: 4 },
    ],
    correctId: 4
  },
  {
    question: 'Which of the following is <strong><em>not</em></strong> a valid JavaScript loop?',
    answers: [
      { answer: 'for (i = 0; i < 5; i++)', id: 1 },
      { answer: 'while (i < 5)', id: 2 },
      { answer: 'loop (i [0...4])', id: 3 },
      { answer: 'array.forEach(myFunc)', id: 4 },
    ],
    correctId: 3
  },
  {
    question: 'How do you access a JavaScript object\'s property?',
    answers: [
      { answer: 'obj->propName', id: 1 },
      { answer: 'obj{propName}', id: 2 },
      { answer: 'obj.propName{}', id: 3 },
      { answer: 'obj.propName', id: 4 },
    ],
    correctId: 4
  },
  {
    question: 'Which statement will evaluate to true?',
    answers: [
      { answer: '0 == false', id: 1 },
      { answer: '1 === true', id: 2 },
      { answer: 'true === \'true\'', id: 3 },
      { answer: '42 != \'42\'', id: 4 },
    ],
    correctId: 1
  },
  {
    question: 'How can you calculate the integer portion of a quotient?',
    answers: [
      { answer: 'q = x % y', id: 1 },
      { answer: 'q = x // y', id: 2 },
      { answer: 'q = Math.floor(x / y)', id: 3 },
      { answer: 'q = Math.ceil(x / y)', id: 4 },
    ],
    correctId: 3
  },
];
// initalize some useful constants
const QUIZ_QUESTION_COUNT = 5;
const TIME_PER_QUESTION = 15;  // time in seconds
const QUIZ_TIME = QUIZ_QUESTION_COUNT * TIME_PER_QUESTION;  // how long the quiz lasts, in seconds
const QUIZ_PENALTY = TIME_PER_QUESTION; // how many seconds to subtract for an incorrect answer


// global variables
var highScores = [];
var quizTimer = 0;
var questionNumber = 0;
var numCorrect = 0;
var questionElementsArray = [];
var selectedQuestionsData = [];
var tick;  // for quiz timer interval
var resultTimer;  // for question result message timeout


// pre-built page elements
var topBarEl = document.querySelector('#top-bar');
var viewHighScoresEl = document.querySelector('#view-high-scores');
var quizTimerEl = document.querySelector('#quiz-timer');
var welcomeEl = document.querySelector('#welcome');
var startQuizEl = document.querySelector('#start-quiz');
var quizEl = document.querySelector('#quiz');
var quizDoneEl = document.querySelector('#quiz-done');
var highScoresEl = document.querySelector('#high-scores');
var saveScoreEl = document.querySelector('#save-score');
var resultEl = document.querySelector('#result');
var goBackButtonEl = document.querySelector('#go-back');
var tryAgainButtonEl = document.querySelector('#try-again');
var clearHighScoresButtonEl = document.querySelector('#clear-high-scores');

var shuffle = function(arr) {
  var shuffled = [];
  while (arr.length > 1) {
    var idx = Math.floor(Math.random() * arr.length);
    shuffled.push(arr.splice(idx, 1)[0]);
  }
  shuffled.push(arr[0]);

  return shuffled;
};

var initQuiz = function() {
  topBarEl.classList.remove('hidden');
  welcomeEl.classList.remove('hidden');
  quizEl.classList.add('hidden');
  quizDoneEl.classList.add('hidden');
  highScoresEl.classList.add('hidden');
  saveScoreEl.classList.add('hidden');
  resultEl.classList.add('hidden');
  document.querySelector('#no-score').classList.add('hidden');

  loadHighScores();  // might not need this one
  quizTimer = 0;
  questionNumber = 0;
  numCorrect = 0;
  updateQuizTimerEl();
  prepareQuestions();
};

var loadHighScores = function() {
  var highScoresJSON = localStorage.getItem('highScores');
  if (!highScoresJSON) {
    return;  // do nothing
  }
  highScores = JSON.parse(highScoresJSON);
  highScores.sort((a, b) => {
    return b.score - a.score;
  });
};

var addHighScore = function(initials, score) {
  highScores.push({
    initials: initials,
    score: score
  });
  localStorage.setItem('highScores', JSON.stringify(highScores));
};

var clearHighScores = function() {
  highScores = [];
  localStorage.setItem('highScores', JSON.stringify(highScores));
}

var updateQuizTimerEl = function() {
  quizTimerEl.textContent = quizTimer;
};

var prepareQuestions = function() {
  // select QUIZ_QUESTION_COUNT questions, randomly
  selectedQuestionsData = JSON.parse(JSON.stringify(quizQuestionsData));  // clone the full original questions data array
  while (selectedQuestionsData.length > QUIZ_QUESTION_COUNT) {
    var idx = Math.floor(Math.random() * selectedQuestionsData.length);
    selectedQuestionsData.splice(idx, 1);
  }

  // suffle each question's answers
  for (var i = 0; i < selectedQuestionsData.length; i++) {
    selectedQuestionsData[i].answers = shuffle(selectedQuestionsData[i].answers);
  }

  // build question elements
  questionElementsArray = [];

  // for each question
  for (var i = 0; i < selectedQuestionsData.length; i++) {
    // create an element to encapsulate the question and associated answer buttons
    var questionBlockEl = document.createElement('div');
    questionBlockEl.className = 'question-block';

    // add the question
    var questionEL = document.createElement('p');
    questionEL.className = 'question';
    questionEL.setAttribute('data-question-id', i);
    questionEL.innerHTML = selectedQuestionsData[i].question;
    questionBlockEl.appendChild(questionEL);

    // add the answers
    var answersEl = createAnswerButtonsEl(selectedQuestionsData[i].answers);
    questionBlockEl.appendChild(answersEl);

    // add the question element to the question elements array
    questionElementsArray.push(questionBlockEl);
  }
};

var createAnswerButtonsEl = function(answers) {
  var answersEl = document.createElement('div');
  for (var i = 0; i < 4; i++) {
    var answerButtonEl = document.createElement('button');
    answerButtonEl.className = 'btn answer-btn';
    answerButtonEl.setAttribute('data-answer-id', answers[i].id);
    answerButtonEl.textContent = (i + 1) + '. ' + answers[i].answer;
    answersEl.appendChild(answerButtonEl);
  }

  answersEl.addEventListener('click', answerButtonHandler);

  return answersEl;
};

var showNextQuestion = function() {
  var oldQuestion = document.querySelector('.question-block');
  if (oldQuestion) {
    oldQuestion.remove();
  }
  if (questionNumber < questionElementsArray.length) {
    // display question and answer buttons
    quizEl.appendChild(questionElementsArray[questionNumber]);
  } else {
    endQuiz();
  }
};

var endQuiz = function() {
  // calculate final score based on number of correct answers
  var finalScore = Math.ceil((numCorrect / questionElementsArray.length) * 100);

  clearInterval(tick);

  quizEl.classList.add('hidden');
  quizDoneEl.classList.remove('hidden');
  document.querySelector('#final-score').textContent = finalScore;

  if (finalScore) {
    saveScoreEl.classList.remove('hidden');
  } else {
    document.querySelector('#no-score').classList.remove('hidden');
  }
};

var showHighScores = function() {
  loadHighScores();

  // build high scores ul
  var oldHighScoresListEl = document.querySelector('#scores-list');
  var newHighScoresListEl = document.createElement('ul');
  newHighScoresListEl.setAttribute('id', 'scores-list');
  for (var i = 0; i < highScores.length; i++) {
    var highScoresListItemEl = document.createElement('li');
    highScoresListItemEl.className = 'high-scores-item';
    highScoresListItemEl.textContent = (i + 1) + '. ' + highScores[i].initials + ' - ' + highScores[i].score;
    newHighScoresListEl.appendChild(highScoresListItemEl);
  }
  highScoresEl.replaceChild(newHighScoresListEl, oldHighScoresListEl);


  // make sure everything else is hidden
  topBarEl.classList.add('hidden');
  welcomeEl.classList.add('hidden');
  quizEl.classList.add('hidden');
  quizDoneEl.classList.add('hidden');
  highScoresEl.classList.remove('hidden');
  saveScoreEl.classList.add('hidden');
  resultEl.classList.add('hidden');
};


/*** event handlers ***/

var startQuizHandler = function(event) {
  // hide the welcome message
  welcomeEl.classList.add('hidden');

  questionNumber = 0;
  // start the countdown timer
  quizTimer = QUIZ_TIME;
  updateQuizTimerEl();
  tick = setInterval(function() {
    if (quizTimer > 0) {
      quizTimer--;
    } else {
      endQuiz();
    }
    updateQuizTimerEl();
  }, 1000);

  // enter the quiz questions "loop"
  showNextQuestion();

  // and show the quiz
  quizEl.classList.remove('hidden');
};

var answerButtonHandler = function(event) {
  // capture answer
  var answerId = parseInt(event.target.getAttribute('data-answer-id'));
  var questionId = parseInt(document.querySelector('.question').getAttribute('data-question-id'));

  // compare it with correct answer
  // display the result of the previous question and update timer if incorrect
  if (answerId === selectedQuestionsData[questionNumber].correctId) {
    resultEl.textContent = 'Correct!';
    numCorrect++;
  } else {
    resultEl.textContent = 'Wrong!';
    quizTimer -= QUIZ_PENALTY;
    if (quizTimer < 0) {
      quizTimer = 0;
    }
    updateQuizTimerEl();
  }
  resultEl.classList.remove('hidden');
  clearTimeout(resultTimer);
  resultTimer = setTimeout(function() {
    resultEl.classList.add('hidden');
    resultEl.textContent = '';
  }, 1000);
    
  questionNumber++;
  showNextQuestion();
};

var viewHighScoresHandler = function(event) {
  showHighScores()
};

var saveHighScoreHandler = function(event) {
  if (event.target.getAttribute('id') !== 'initials-submit') {
    return;
  }
  var initials = this.querySelector('#save-score-input').value;
  this.querySelector('#save-score-input').value = '';
  var finalScore = document.querySelector('#final-score').textContent;

  addHighScore(initials, finalScore);
  showHighScores();
};

var clearHighScoresHandler = function(event) {
  clearHighScores();
  showHighScores();
};

// disable hover effect for buttons on touchscreens
var disableHover = function(event) {
  var touchStyleEl = document.createElement('style');
  touchStyleEl.setAttribute('type', 'text/css');
  touchStyleEl.textContent = ".btn:hover { background: rgb(83, 11, 116); }";
  document.querySelector('#main-content').insertBefore(touchStyleEl, welcomeEl);
}

// event listeners
viewHighScoresEl.addEventListener('click', viewHighScoresHandler);
startQuizEl.addEventListener('click', startQuizHandler);
saveScoreEl.addEventListener('click', saveHighScoreHandler);
clearHighScoresButtonEl.addEventListener('click', clearHighScoresHandler);
goBackButtonEl.addEventListener('click', initQuiz);
tryAgainButtonEl.addEventListener('click', initQuiz);

// detect if using touch
startQuizEl.addEventListener('touchstart', disableHover, { passive: true, once: true });


// start the app on load
initQuiz();
