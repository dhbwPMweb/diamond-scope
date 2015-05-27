var DiamondScope = (function (){
    
    var questionArray = [];
    
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
        
    }
   
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
        console.log(questionArray);   
    }
    
    return {
        init,   
    }
    
})();

$(function (){
    DiamondScope.init();  
});
