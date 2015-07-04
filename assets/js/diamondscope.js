var game;

var DiamondScope = (function () {

    var Question = function (question, answers, rightAnswer, difficulty, id) {
        this.question = question;
        this.answers = answers;
        this.rightAnswer = rightAnswer;
        this.difficulty = difficulty;
        this.id = id;
        this.used = false;
    };

    Question.prototype = {

        getRightAnswer: function () {
            return this.rightAnswer;
        },

    };

    var Player = function (id, name) {
        this.id = id;
        this.name = name;
        this.questionCount = 0;
        this.joker = {
            fifty: 1,
            audience: 1
        }
    };

    Player.prototype = {

        useJoker: function (joker) { //joker 0:fifty 1:audience
            if (joker == 0) {
                if (this.joker.fifty != 0) {
                    this.joker.fifty = 0;
                    return game.useFiftyFifty(currentQuestion.rightAnswer);
                } else {
                    return [];
                }
            }
            if (joker == 1) {
                if (this.joker.audience != 0) {
                    this.joker.audience = 0;
                    return game.useAudience(currentQuestion.difficulty, currentQuestion.rightAnswer);
                } else {
                    return [];
                }
            }
        },

    }

    var Game = function (questionArray) {
        this.round = 0;
        this.players = [];
        this.gameMode = undefined;
        this.ranking = {
            rounds: {},
            points: {}
        };
        this.questions = questionArray;

        this.questions.forEach(function (e) {
            e.used = false;
        });

        this.questionID = 0;
        this.currentPlayer = 0;
        this.expulsedPlayers = undefined;
    };

    Game.prototype = {

        addPlayer: function (name) {
            id = this.players.length;
            this.players.push(new Player(id, name));
        },

        useFiftyFifty: function (rightAnswer) {
            //"removes" two wrong answers
            //returns an array containing 4 boolean values
            //false values represent deleted answers, true represents the two left choices

            var fifty = [false, false, false, false];
            fifty[rightAnswer] = true;

            //get a random answer which mustn't be the correct answer
            var random = parseInt(Math.random() * 4);
            while (random == rightAnswer) {
                random = parseInt(Math.random() * 4);
            }

            fifty[random] = true;

            return fifty;
        },

        useAudience: function (difficulty, rightAnswer) {
            //simulates the voting results of an audience based on the difficulty
            //returns an array containing 4 integers between 0-100
            //the percentage of the correct answer is located at the "rightAnswer"-index


            //difficulty from 0 to 3
            var offset;
            switch (difficulty) {
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
            distribution[0] = parseInt(Math.random() * 20) + 40 - offset;
            distribution[1] = parseInt((100 - distribution[0]) / 3 * (Math.random() + 0.4));
            distribution[2] = parseInt((100 - distribution[0]) / 3 * (Math.random() + 0.4));
            distribution[3] = 100 - distribution[0] - distribution[1] - distribution[2];

            //switch distribution[rightAnswer] with distribution[0]
            var tmp = distribution[rightAnswer];
            distribution[rightAnswer] = distribution[0];
            distribution[0] = tmp;

            return distribution;
        },

        nextPlayer: function () {

            this.currentPlayer++;
            if (this.currentPlayer == this.players.length) {
                this.currentPlayer = 0;
//                this.change = true;
            }

            while (this.expulsedPlayers[this.currentPlayer]) {

//                this.change = false;
                this.currentPlayer++;
                if (this.currentPlayer == this.players.length) {
                    this.currentPlayer = 0;
//                    this.change = true;
                }

            }

        },
        
        conclude: function () {
            
            obj = this;
            
            if (obj.gameMode == 1) {
                obj.players.sort(function (a, b) {
                   return b.questionCount - a.questionCount;
                });
                
                if(obj.ranking.rounds[obj.players[0].id] === undefined) game.ranking.rounds[game.players[0].id] = 0;
                obj.ranking.rounds[obj.players[0].id]++;
                
                content = '<h1>Herzlichen Glückwunsch ' + obj.players[0].name + '</h1>';
                
                obj.players.forEach( function(e, i){
                    
                    e.questionCount--;
                    
                    if(obj.ranking.points[e.id] === undefined) obj.ranking.points[e.id] = 0;
                    obj.ranking.points[e.id] += e.questionCount;
                    
                    content += '<h1>' + (i + 1) + '. ' + e.name + ' mit ' + e.questionCount + ' Punkten</h1>';
                    e.questionCount = 0;
                    
                    e.joker.audience = 1;
                    e.joker.fifty = 1;
                    
                });
                
            } else if (obj.gameMode == 0) {
                
                player = obj.players[0];
                player.questionCount--;
                
                content = "<h1>Du hast " + player.questionCount + " von " + QUESTIONS_PER_ROUND + " Fragen richtig beantwortet!</h1>";
                
                if(obj.ranking.points[0] === undefined) obj.ranking.points[0] = 0;
                obj.ranking.points[0] += player.questionCount;
                
                player.questionCount = 0;
                player.joker.audience = 1;
                player.joker.fifty = 1;
                
            }
            
            return content;
            
        },
        
        end: function() {
            
            content = "";
            
            this.round++;
            
            if(game.gameMode == 0){
                
                content += '<h1>Du hast ' + this.round + ' Runden gespielt und dabei ' + obj.ranking.points[0] + ' Punkte erreicht</h1>';
                
            } else if(game.gameMode == 1){
                
                obj = this;
                
                game.players.sort(function(a, b) {
                    
                    obj.ranking.points[b.id] - obj.ranking.points[a.id];
                    
                });
                
                game.players.forEach(function(e, i) {
                    
                    if(obj.ranking.rounds[e.id] === undefined) obj.ranking.rounds[e.id] = 0;
                   
                    content += '<h1>' + (i + 1) + '. ' + e.name + ' mit ' + obj.ranking.points[e.id] + ' Punkten und ' + obj.ranking.rounds[e.id] + ' gewonnenen Runden</h1>';
                    
                });
                
            }
            
            return content;
            
        },

    };

    var questionArray = [];
    var currentQuestion;
    //var game;

    var init = function () {
        sizeCheck();
        eventhandler();
        $.getJSON(SERVER_URL + QUESTION_FILE, function (data) {
            questionArray = data;
            questionArray.forEach(function (e, i) {
                questionArray[i] = new Question(e.question, e.answers, e.rightAnswer, e.difficulty, e.id);
            });
            initializeGame();
        });
    };

    var eventhandler = function () {

        $(window).resize(function () {
            sizeCheck();
        });

        $(window).load(function () {
            sizeCheck();
        });

        $(document).on('click', '#joker-fifty', function () {

            $(this).addClass('disabled');

            answers = game.players[game.currentPlayer].useJoker(0);
            answers.forEach(function (e, i) {
                if (!e) {
                    char = (i == 0) ? 'a' : (i == 1) ? 'b' : (i == 2) ? 'c' : 'd';
                    $('#answer-' + char).html('');
                    $('#answer-' + char).parent().addClass('disabled');
                }
            });

        });

        $(document).on('click', '#joker-audience', function () {

            $(this).addClass('disabled');

            answers = game.players[game.currentPlayer].useJoker(1);
            answers.forEach(function (e, i) {
                char = (i == 0) ? 'a' : (i == 1) ? 'b' : (i == 2) ? 'c' : 'd';
                $('#answer-' + char).html(answers[i] + '%');
            });

        });

        $(document).on('click', '.answer', function () {
            if(!($(this).hasClass('disabled'))){
                $('.answer').addClass('disabled');
                id = $(this).data('id');
                if (id == currentQuestion.rightAnswer) {
                    $(this).addClass('green');
                    setTimeout(function () {
    
                        if (game.gameMode == 1) game.nextPlayer();
    
                        nextQuestion();
                    }, 1500);
                } else {
                    $(this).addClass('red');
                    $('.answer').each(function () {
                        if ($(this).data('id') == currentQuestion.rightAnswer)
                            $(this).addClass('yellow');
                    });
                    setTimeout(function () {
                        expulsePlayer();
                    }, 1500);
                }
            }
        });

    };

    var sizeCheck = function () {
        if (($(window).outerHeight()) / 9 > ($(window).outerWidth()) / 16) {
            $('body > #video-background').css({
                'width': 'auto',
                'height': '100%'
            });
            $('#video-background-inner').css({
                'width': 'auto',
                'height': '150%'
            });
        } else {
            $('body > #video-background').css({
                'width': '100%',
                'height': 'auto'
            })
            $('#video-background-inner').css({
                'width': '150%',
                'height': 'auto'
            })
        }

        //Vertical align
        $(".vertical-center").each(function () {
            $(this).css("margin-top", ($($(this).attr("data-container")).outerHeight() / 2) - ($(this).outerHeight()));
        });

        $(".vertical-center-2").each(function () {
            $(this).css("margin-top", ($($(this).attr("data-container")).outerHeight() / 2) - ($(this).outerHeight() / 2));
        });
    };

    var initializeGame = function () {
        game = new Game(questionArray);
        draw.startMenu();
    };

    var nextQuestion = function () {
        
        difficulty = Math.floor((game.players[game.currentPlayer].questionCount++) / 3);
        
        if(game.players[game.currentPlayer].questionCount < QUESTIONS_PER_ROUND) {
            
            draw.frage(difficulty);
            
        } else {
            
            draw.endView(); 
            
        }

    };

    var expulsePlayer = function () {

        if (game.gameMode == 0) {

            draw.endView();

        } else if (game.gameMode == 1) {

            game.expulsedPlayers[game.currentPlayer] = true;

            size = (function (obj) {
                size = 0;
                for (e in obj) size++;
                return size;
            })(game.expulsedPlayers);

            if (size == game.players.length) {

                draw.endView();

            } else {

                game.nextPlayer();
                nextQuestion();
            }

        }

    };

    var draw = (function () {

        var startMenu = function () {

            content = '<div class="container-fluid logo-box">' +
                '<div class="row">' +
                '<div class="col-md-8 col-centered">' +
                '<img src="assets/svgs/quzzeldull_logo_text_horizontal.svg" class="img-responsive start-logo" alt="Diamond Scope">' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="vertical-center container-fluid button-box" data-container="#main-center">' +
                '<div class="menu-button col-centered rounded-div main-design btn" id="singleplayer-button">' +
                '<h1>Singleplayer</h1>' +
                '</div><div class="clearfix"></div>' +
                '<div class="menu-button col-centered rounded-div main-design btn" id="multiplayer-button">' +
                '<h1>Multiplayer</h1>' +
                '</div><div class="clearfix"></div>' +
                '</div>';

            $('#content-div').html(content);

            $('#singleplayer-button').on('click', function () {
                $(this).off('click');
                changeScreen(singlePlayer);
            });

            $('#multiplayer-button').on('click', function () {
                $(this).off('click');
                changeScreen(multiPlayer);
            });

        };

        var singlePlayer = function () {

            content = '<div class="container-fluid vertical-center-2" data-container="#main-center">' +
                '<div class="row" id="player-row">' +
                '<div class="col-xs-6 col-centered">' +
                '<div class="main-design">' +
                '<h1>Spielername</h1>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="row">' +
                '<div class="col-xs-6 col-centered">' +
                '<div class="main-design">' +
                '<input type="text" class="main-design names" id="player-name">' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="row" id="button-row">' +
                '<div class="player-screen-button pull-left">' +
                '<div class="main-design rounded-div btn" id="back-button">' +
                '<h1>Zur&uuml;ck</h1>' +
                '</div>' +
                '</div>' +
                '<div class="player-screen-button pull-right">' +
                '<div class="main-design rounded-div btn" id="next-button">' +
                '<h1>Weiter</h1>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';

            $('#content-div').html(content);

            $('#back-button').on('click', function () {
                $(this).off('click');
                changeScreen(startMenu);
            });

            $('#next-button').on('click', function () {
                $(this).off('click');
                game.addPlayer($('#player-name').val());
                game.gameMode = 0; // 0 -> Singleplayer
                changeScreen(questionScreen);
                setTimeout(function () {
                    nextQuestion();
                }, 501);
            });

        };

        var multiPlayer = function () {

            content = '<div class="container-fluid vertical-center-2" data-container="#main-center">' +
                '<div class="row" id="player-row">' +
                '<div class="col-xs-6 col-centered">' +
                '<div class="main-design">' +
                '<h1>Spielernamen</h1>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="row">' +
                '<div class="multiplayer-names col-centered relative">' +
                '<div class="main-design" id="player-names">' +
                '<input type="text" class="main-design names" id="player-name-1" placeholder="Spieler 1">' +
                '<input type="text" class="main-design names" id="player-name-2" placeholder="Spieler 2">' +
                '</div>' +
                '</div>                ' +
                '</div>' +
                '<div class="row" id="button-row">' +
                '<div class="player-screen-button pull-left">' +
                '<div class="main-design rounded-div btn" id="back-button">' +
                '<h1>Zur&uuml;ck</h1>' +
                '</div>' +
                '</div>' +
                '<div class="player-screen-button pull-right">' +
                '<div class="main-design rounded-div btn" id="next-button">' +
                '<h1>Weiter</h1>' +
                '</div>' +
                '</div>' +
                '<div class="multiplayer-count btn-group" role="group">' +
                '<div type="button" id="player-2" data-id="2" class="btn rounded-div main-design count selected"><h1>2</h1></div>' +
                '<div type="button" id="player-3" data-id="3" class="btn rounded-div main-design count"><h1>3</h1></div>' +
                '<div type="button" id="player-4" data-id="4" class="btn rounded-div main-design count"><h1>4</h1></div>' +
                '<div type="button" id="player-5" data-id="5" class="btn rounded-div main-design count"><h1>5</h1></div>' +
                '</div>' +
                '</div>' +
                '</div>';

            $('#content-div').html(content);

            $('#back-button').on('click', function () {
                $(this).off('click');
                changeScreen(startMenu);
            });

            $('.count').on('click', function () {

                $('.count').removeClass('selected');
                $(this).addClass('selected');

                content = "";

                for (i = 1; i <= $(this).data('id'); i++) {
                    content += '<input type="text" class="main-design names" id="player-name-' + i + '" placeholder="Spieler ' + i + '">';
                }


                $('#player-names').html(content);

                sizeCheck();
            });

            $('#next-button').on('click', function () {

                $('.names').each(function () {
                    game.addPlayer($(this).val());
                });

                game.gameMode = 1; // 1 -> Multiplayer
                game.questionID++;
                game.expulsedPlayers = {};
                changeScreen(questionScreen);
                setTimeout(function () {
                    nextQuestion();
                }, 501);

            });

        };

        var questionScreen = function () {

            content = '<div class="container-fluid question-box">' +
                '<div class="row">' +
                '<div>' +
                '<div class="col-xs-5 pull-left">' +
                '<img src="assets/svgs/quzzeldull_logo_text_horizontal.svg" class="img-responsive" alt="Diamond Scope">' +
                '</div>' +
                '<div class="col-xs-4 pull-right">' +
                '<div class="main-design" id="current-question">' +
                '<h3>Frage X</h3>' +
                '</div>' +
                '<div class="main-design" id="player">' +
                '<h4>Spieler X</h4>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="clearfix"></div>' +
                '<div class="row">' +
                '<div class="col-xs-12 main-design">' +
                '<h1 id="question">Wie hei&szlig;t eine gängige Projektmanagement-Methode?</h1>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="container-fluid answer-box">' +
                '<div class="container-fluid">' +
                '<div class="col-md-12 rounded-div main-design answer" data-id="0">' +
                '<h4 class="pull-left">A</h4>' +
                '<h4 id="answer-a">Duke1</h4>' +
                '</div>' +
                '<div class="col-md-12 rounded-div main-design answer" data-id="1">' +
                '<h4 class="pull-left">B</h4>' +
                '<h4 id="answer-b">Prince2</h4>' +
                '</div>' +
                '<div class="col-md-12 rounded-div main-design answer" data-id="2">' +
                '<h4 class="pull-left">C</h4>' +
                '<h4 id="answer-c">King4</h4>' +
                '</div>' +
                '<div class="col-md-12 rounded-div main-design answer" data-id="3">' +
                '<h4 class="pull-left">D</h4>' +
                '<h4 id="answer-d">Queen3</h4>' +
                '</div>' +
                '</div>' +
                '<div class="row">' +
                '<div class="col-xs-2 pull-right rounded-div joker-button main-design" id="joker-audience">' +
                '<h4>Publikum</h4>' +
                '</div>' +
                '<div class="col-xs-2 pull-right rounded-div joker-button main-design" id="joker-fifty">' +
                '<h4>2 Aus 4</h4>' +
                '</div>' +
                '</div>' +
                '</div>';

            $('#content-div').html(content);

        };

        var endScreen = function () {

            content = '<div class="container-fluid question-box">' +
                         '<div class="row">' +
                            '<div>' +
                                '<div class="col-xs-5 pull-left">' +
                                    '<img src="assets/svgs/quzzeldull_logo_text_horizontal.svg" class="img-responsive" alt="Diamond Scope">' +
                                '</div>' +
                            '</div>' +
                         '</div>' +
                        '</div>' +
                        '<div class="vertical-center-2" data-container="#main-center">' +
                            '<div class="row">' +
                                '<div class="col-xs-12 main-design">';
            
            content += game.conclude();
            
            content +=          '</div>' +
                            '</div>' +
                            '<div class="menu-button rounded-div main-design btn" id="new-game-button">' +
                                '<h1>Neues Spiel</h1>' +
                            '</div>' +
                            '<div class="menu-button rounded-div main-design btn" id="report-button">' +
                                '<h1>Zur Auswertung</h1>' +
                            '</div>' +
                        '</div>' +
                        '</div>';

            $('#content-div').html(content);
            
            $('#new-game-button').on('click', function () {
                
                if(game.round++ < ROUND_LIMIT){
                    
                    game.questions.forEach( function(e){
                        e.used = false; 
                    });
                    
                    game.expulsedPlayers = {};
                    changeScreen(questionScreen);
                    setTimeout(function () {
                        nextQuestion();
                    }, 501);
                    
                } else {
                    
                    $(this).html('<h1>Es ist leider nicht möglich mehr als ' + ROUND_LIMIT + ' Runden zu spielen</h1>');
                    $(this).off('click');
                    
                }
                
            });
            
            $('#report-button').on('click', function(){
                reportScreen();
            });

        };

        var reportScreen = function () {

            content = '<div class="container-fluid question-box">' +
                         '<div class="row">' +
                            '<div>' +
                                '<div class="col-xs-5 pull-left">' +
                                    '<img src="assets/svgs/quzzeldull_logo_text_horizontal.svg" class="img-responsive" alt="Diamond Scope">' +
                                '</div>' +
                            '</div>' +
                         '</div>' +
                        '</div>' +
                        '<div class="vertical-center-2" data-container="#main-center">' +
                            '<div class="row">' +
                                '<div class="col-xs-12 main-design">';
            
            content += game.end();
            
            content +=          '</div>' +
                            '</div>' +
                            '<div class="menu-button rounded-div main-design btn" id="menu-button">' +
                                '<h1>Zum Hauptmenu</h1>' +
                            '</div>' +
                        '</div>' +
                        '</div>';

            $('#content-div').html(content);
            
            $('#menu-button').on('click', function(){
                game = new Game(questionArray);
                startMenu();
            });

        };

        var frage = function (difficulty) { //draw.question!

            function getQuestion(difficulty) {

                selectedQuestions = $.grep(game.questions, function (e, i) {
                    return ((e.difficulty == difficulty) && (e.used == false));
                });

                currentQuestion = selectedQuestions[Math.floor(Math.random() * selectedQuestions.length)];

                currentQuestion.used = true;

                return currentQuestion;
            };

            var question = getQuestion(difficulty);
            var scrambledAnswers = [0,1,2,3];

            var j, i, temp, x = 0;
            for (i = 0; i < 4; i++) {
                j = Math.floor(Math.random() * (i + 1));
                if (j == x) {
                    question.rightAnswer = i;
                    x = i;
                }
                temp = question.answers[i];
                question.answers[i] = question.answers[j];
                question.answers[j] = temp;
                temp = scrambledAnswers[i];
                scrambledAnswers[i] = scrambledAnswers[j];
                scrambledAnswers[j] = temp;
            }

            //Difficulty
            category = " (Kategorie: " + (difficulty + 1) + ")";
            player = "Spieler " + (game.players[game.currentPlayer].id + 1) + " - " + game.players[game.currentPlayer].name;
            $('#current-question > h3').html('Frage ' + game.players[game.currentPlayer].questionCount + category);
            $('#player > h4').html(player);
            $('#question').html(question.question);
            $('#answer-a').html(question.answers[0]);
            $('#answer-b').html(question.answers[1]);
            $('#answer-c').html(question.answers[2]);
            $('#answer-d').html(question.answers[3]);
            $('.answer').removeClass('red');
            $('.answer').removeClass('green');
            $('.answer').removeClass('yellow');
            $('.answer').removeClass('disabled');
            $('.joker-button').removeClass('disabled');
            if (game.players[game.currentPlayer].joker.audience == 0) $('#joker-audience').addClass('disabled');
            if (game.players[game.currentPlayer].joker.fifty == 0) $('#joker-fifty').addClass('disabled');
            
            //Voice
            var audio = $('audio').get(0);
            var $audio = $('audio');
            var voicePath = 'assets/voices/voice';
            var fileType = '.mp3';
            
            $audio.attr('src', voicePath + question.id + '-q' + fileType);
            audio.addEventListener('ended', function() {
                $audio.attr('src', voicePath + '-answer-a' + fileType);
                audio.addEventListener('ended', function() {
                    $audio.attr('src', voicePath + question.id + '-' + scrambledAnswers[0] + fileType);
                    audio.addEventListener('ended', function() {
                        $audio.attr('src', voicePath + '-answer-b' + fileType);
                        audio.addEventListener('ended', function() {
                            $audio.attr('src', voicePath + question.id + '-' + scrambledAnswers[1] + fileType);
                            audio.addEventListener('ended', function() {
                                $audio.attr('src', voicePath + '-answer-c' + fileType);
                                audio.addEventListener('ended', function() {
                                    $audio.attr('src', voicePath + question.id + '-' + scrambledAnswers[2] + fileType);
                                    audio.addEventListener('ended', function() {
                                        $audio.attr('src', voicePath + '-answer-d' + fileType);
                                        audio.addEventListener('ended', function() {
                                            $audio.attr('src', voicePath + question.id + '-' + scrambledAnswers[3] + fileType);
                                            audio.addEventListener('ended', function() {
                                                audio.pause();
                                            });
                                            audio.play();
                                        });
                                        audio.play();
                                    });
                                    audio.play();
                                });
                                audio.play();
                            });
                            audio.play();
                        });
                        audio.play();
                    });
                    audio.play();
                });
                audio.play();
            });
            audio.play();
        };

        var endView = function () {
            changeScreen(endScreen);
        };

        var changeScreen = function (func) {
            $('#content-div').addClass('fade');
            setTimeout(function () {
                func();
                setTimeout(function () {
                    $('#content-div').removeClass('fade');
                }, 500);
                sizeCheck();
            }, 500);
        };

        return {
            startMenu: startMenu,
            frage: frage,
            endView: endView,
        };

    })();

    return {
        init: init,
    }

})();

$(function () {
    $(window).load(function () {

        setTimeout(function () {

            $('body > #loading').css('opacity', '0');

            setTimeout(function () {
                $('body > #loading').remove();
            }, 1001);

        }, 1500);
    });

    DiamondScope.init();
});