//TODO Servus Design Team hier, ich habe leider keine Ahnung wo zur Hölle das hin muss, lasst das mal den tobuto machen

$(window).resize(function() {
    alert();
    if(($(window).outerHeight)/9>($(window).outerWidth)/16) {
        alert();
        $('body > #video-background').css({'width': 'auto', 'height': '100%'});
    }
});

//TODO Danke, das war's auch schon ;)

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
        if(joker == 2) {
			if(this.joker.audience != 0){
				this.joker.audience = 0;
				game.useAudience(currentQuestion.difficulty, currentQuestion.rightAnswer);
			}			
		}
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
	
	useFiftyFifty: function(rightAnswer){
		//"removes" two wrong answers
		//returns an array containing 4 boolean values
		//false values represent deleted answers, true represents the two left choices
		
		var fifty = [false, false, false, false];
		fifty[rightAnswer] = true;
		
		//get a random answer which mustn't be the correct answer
		var random = parseInt(Math.random()*4);
		while(random == rightAnswer)
		{
			random = parseInt(Math.random()*4);
		}
		
		fifty[random] = true;
		
		return fifty;
	},
	
	useAudience: function(difficulty, rightAnswer){
		//simulates the voting results of an audience based on the difficulty
		//returns an array containing 4 integers between 0-100
		//the percentage of the correct answer is located at the "rightAnswer"-index


		//difficulty from 0 to 3
		var offset;
		switch(difficulty){
			case 0:
				offset = 0;
				break;
			case 1:
				offset = 5;
				break;
			case 2:
				offset = 10;
				break;
			case 3:
				offset = 14;
				break;
			default: 
				offset = 0;
		}
		
		//distribution[0] is the right answer
		var distribution = [];
		distribution[0] = parseInt(Math.random()*20)+40-offset;
		distribution[1] = parseInt((100-distribution[0])/3 * (Math.random()+0.4));
		distribution[2] = parseInt((100-distribution[0])/3 * (Math.random()+0.4));
		distribution[3] = 100-distribution[0]-distribution[1]-distribution[2];
		
		//switch distribution[rightAnswer] with distribution[0]
		var tmp = distribution[rightAnswer];
		distribution[rightAnswer] = distribution[0];
		distribution[0] = tmp;
		
		return distribution;
	},
}
    
    //...
    
/*}*/; //TODO Dinge die nicht funktionieren, fixen!
    
var DiamondScope = (function (){
    
    //var questionArray = [], //TODO s.o.
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
