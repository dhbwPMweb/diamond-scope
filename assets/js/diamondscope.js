var game;

var DiamondScope = (function (){
    
    var Question = function (question, answers, rightAnswer, difficulty, id){
        this.question = question;
        this.answers = answers;
        this.rightAnswer = rightAnswer;
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
            if(joker == 1) {
                if(this.joker.fifty != 0){
                    this.joker.fifty = 0;
                    return game.useFiftyFifty(currentQuestion.rightAnswer);
                } else {
                    return [];   
                }
            }
            if(joker == 2) {
                if(this.joker.audience != 0){
                    this.joker.audience = 0;
                    return game.useAudience(currentQuestion.difficulty, currentQuestion.rightAnswer);
                }			
            }
        },
        
    }
    
    var Game = function (questionArray) {
        this.round = 0;
        this.players = [];
        this.ranking = {rounds: undefined, points: undefined};
        this.questions = questionArray;
    };
    
    Game.prototype = {
        
        addPlayer: function (name){
            id = this.players.length;
            this.players.push(new Player(id, name));
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
                    offset = 9;
                    break;
                case 3:
                    offset = 13;
                    break;
                case 4:
                    offset = 17;
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
        
        //...
    };
    
    var questionArray = [];
    var currentQuestion;
    var currentDifficulty;
    //    game;
   
    var init = function (){
        sizeCheck();
        eventhandler();
        $.getJSON(SERVER_URL + QUESTION_FILE, function (data){
           questionArray = data;
           questionArray.forEach( function(e, i){
             questionArray[i] = new Question(e.question, e.answers, e.rightAnswer, e.difficulty, e.id);
	          });
           initializeGame();
        });
    };
    
    var eventhandler = function (){
        
        $(window).resize(function() {
           sizeCheck();
        });
        
        $(document).on('click', '#joker-fifty', function (){
            
            answers = game.useFiftyFifty(currentQuestion.rightAnswer);
            answers.forEach(function (e, i){
                if(!e){
                    char = (i == 0) ? 'a' : (i == 1) ? 'b' : (i == 2) ? 'c' : 'd';
                    $('#answer-' + char).html('');
                }
            });
            
        });
        
        $(document).on('click', '#joker-audience', function (){
            
            answers = game.useAudience(getCurrentDifficulty(game.round), currentQuestion.rightAnswer);
            answers.forEach(function (e, i){
                char = (i == 0) ? 'a' : (i == 1) ? 'b' : (i == 2) ? 'c' : 'd';
                $('#answer-' + char).html(answers[i] + '%');
            });
            
        });
        
        $(document).on('click', '.answer', function (){
            id = $(this).data('id');
            round = (game.round < 15) ? game.round++ : game.round = 0;
            difficulty = getCurrentDifficulty(round);
            if(id == currentQuestion.rightAnswer){
                $(this).addClass('green');
                setTimeout(function(){
                    drawQuestion(difficulty);
                }, 1000);
            } else {
                $(this).addClass('red');
                setTimeout(function(){
                    drawQuestion(difficulty);
                }, 1000);
            }
        });
        
    };
    
    var sizeCheck = function (){
        if(($(window).outerHeight())/9>($(window).outerWidth())/16) {
            $('body > #video-background').css({'width': 'auto', 'height': '100%'});
            $('#video-background-inner').css({'width': 'auto', 'height': '150%'});
        } else {
            $('body > #video-background').css({'width': '100%', 'height': 'auto'})   
            $('#video-background-inner').css({'width': '150%', 'height': 'auto'})   
        }  
    };
                            
    var initializeGame = function(){
        game = new Game(questionArray);
        drawQuestion(0); //nur für Testzwecke
    };
    
    var getQuestion = function(difficulty){
        
        selectedQuestions = $.grep(game.questions, function(e, i){
            return e.difficulty == difficulty;
        });
        
        currentQuestion = selectedQuestions[Math.floor(Math.random()*selectedQuestions.length)];
        
        currentQuestion.difficulty = -1;
        
        return currentQuestion;
    };
    
    var getCurrentDifficulty = function(round) {
        
        return Math.floor(round/3); 
        
    };
    
    var drawQuestion = function (difficulty){
        
        var question = getQuestion(difficulty);
        
        var j, i, temp, x = 0;
        for (i = 0; i < 4; i++) {
            j = Math.floor(Math.random() * (i + 1));
            if(j == x) {
                question.rightAnswer = i;
                x = i;
            }
            temp = question.answers[i];
            question.answers[i] = question.answers[j];
            question.answers[j] = temp;
        }
        
        $('#current-question > h3').html('Frage ' + question.id);
        $('#question').html(question.question);
        $('#answer-a').html(question.answers[0]);
        $('#answer-b').html(question.answers[1]);
        $('#answer-c').html(question.answers[2]);
        $('#answer-d').html(question.answers[3]);
        $('.answer').removeClass('red');
        $('.answer').removeClass('green');
        
    };
    
    return {
        init: init,
    }
    
})();

$(function (){
    DiamondScope.init();  
});
