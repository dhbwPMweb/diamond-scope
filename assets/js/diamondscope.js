var Question = function (question, answers, rightAnswer, difficulty, id){
    this.question = question;
    this.answers = answers;
    this.rigthAnswer = rightAnswer;
    this.difficulty = difficulty;
    this.id = id;
};

Question.prototype = {
    
    getRightAnswer: function (){
        return this.rightAnswer;
    },
    
};

var Player = function (id, name){
    this.id = id;
    this.name = name;
    this.questionCount = 0;
    this.joker = {
        fifty: 1,
        audience: 1
    }
};


Player.prototype = {
    
    useJoker: function (joker){ //joker 1:fifty 2:audience
        if(joker == 1) this.joker.fifty = 0;
        if(joker == 2) this.joker.audience = 0;
    },
    
}

var Game = function (questionArray) {
    this.round = 0;
    this.players = [];
    this.ranking = {rounds: undefined, points: undefined};
    this.questions = question_array;
};

Game.prototype = {
    
    addPlayer: function (){
        //Your Code goes here...
    },
    
    //...
    
};
    
var DiamondScope = (function (){
    
    var questionArray = [],
    var game;
   
    var init = function (){
       $.getJSON(SERVER_URL + QUESTION_FILE, function (data){
          questionArray = data;
          questionArray.forEach( function(e, i){
            questionArray[i] = new Question(e.question, e.answers, e.rigthAnswer, e.difficulty, e.id);
	      });
          initializeGame();
       });
    };
                            
    var initializeGame = function(){
        game = new Game(questionArray);
    };
    
    var getQuestion = function(difficulty){
        
        selectedQuestions = $.grep(game.questions, function(e, i){
            return e.difficulty == difficulty;
        });
        
        currentQuestion = selectedQuestions[Math.floor(Math.random()*selectedQuestions.length)];
        
        delete game.questions[game.questions.indexOf(currentQuestion)];
        
        return currentQuestion;
    };
    
    return {
        init 
    }
    
})();

$(function (){
    DiamondScope.init();  
});
