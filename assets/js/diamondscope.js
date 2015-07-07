var DiamondScope = (function () {

    var Question = function (question, answers, rightAnswer, difficulty, id) {
        this.question = question;
        this.answers = answers;
        this.rightAnswer = rightAnswer;
        this.difficulty = difficulty;
        this.id = id;
        this.used = false;
        this.scrambledAnswers = [0,1,2,3];
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
                    return 0;
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
                
                if(obj.ranking.rounds[obj.players[0].id] == undefined) game.ranking.rounds[game.players[0].id] = 0;
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
                
                if(obj.ranking.points[0] == undefined) obj.ranking.points[0] = 0;
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
    var game;
    var widthBefore = -1;
    var prediff = -1;

    var init = function () {
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
            if(answers != 0) $('#audience').html('.audience:after{opacity:1;}.audience{color:transparent;}');
            
            answers.forEach(function (e, i) {
                char = (i == 0) ? 'a' : (i == 1) ? 'b' : (i == 2) ? 'c' : 'd';
                $('#audience').append('#tag-' + char + ':after{height:' + (30 + e) + '%;content:"' + e + '%";}');
            });

        });

        $(document).on('click', '.answer', function () {
            if(!($(this).hasClass('disabled'))){
                
                $('.answer').addClass('disabled');
                id = $(this).data('id');
                
                $('#main-card').focus();
                
                if (id == currentQuestion.rightAnswer) {
                    //Sound
                    
                    $('audio#event').attr('src', 'assets/sounds/Frage_Richtig.mp3');
                    $('audio#event').get(0).play();
                    
                    //End of Sound
                    $(this).addClass('green');
                    setTimeout(function () {
    
                        if (game.gameMode == 1) game.nextPlayer();
    
                        nextQuestion();
                        
                    }, 1500);
                } else {
                    //Sound
                    
                    $('audio#event').attr('src', 'assets/sounds/Frage_Falsch.mp3');
                    $('audio#event').get(0).play();
                    $('audio#background').get(0).pause();
                    $('audio#voice').get(0).pause();
                    
                    //End of Sound
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

    var verticalAlign = function () {
         //Vertical align
        $(".vertical-center").each(function () {
            $(this).css("margin-top", ($($(this).data("container")).outerHeight() / 2) - ($(this).outerHeight()));
        });

        $(".vertical-center-2").each(function () {
            $(this).css("margin-top", ($($(this).data("container")).outerHeight() / 2) - ($(this).outerHeight() / 2));
        });  
    };
    
    var sizeCheck = function () {
        if(widthBefore==-1) {
            widthBefore = ($(window).width()<1200) ? 1400 : 1000;
        }
        
        if($(window).width()<1200 && widthBefore >= 1200) {
            $('body > .container-fluid').css('height', '0');
            $('body > #main-center.container-fluid').css({'height': '99%'});
            $('#main-card').css('margin', '0.5%');
            $('#video-background, #video-background-inner').attr('src', '');
            $('#video-background-inner').css({'left': '0', 'top': '0', 'width': '100%'});
            $('body, *').css('font-weight', 300);

        } else if ($(window).width()>=1200 && widthBefore < 1200) {
            $('body > .container-fluid').css('height', '15%');
            $('body > #main-center.container-fluid').css({'height': '70%'});
            $('#main-card').css('margin', '5px');
            $('#video-background').attr('src', 'assets/videos/QuzzeldullBackgroundLoopCompressed.mp4');
            $('#video-background-inner').attr('src', 'assets/videos/QuzzeldullBackgroundLoopBlurCompressed.mp4');
            $('#video-background-inner').css({'left': '-25%', 'top': '-25%', 'width': '150%'});
            $('body, *').css('font-weight', 100);
        }
        widthBefore = $(window).width();
            
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
        
        verticalAlign();
        
    };

    var initializeGame = function () {
        game = new Game(questionArray);
        draw.startMenu();
    };

    var nextQuestion = function () {
        
        difficulty = Math.floor((game.players[game.currentPlayer].questionCount++) / 3);
        
        if(game.players[game.currentPlayer].questionCount <= QUESTIONS_PER_ROUND) {
            
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
            
            //Sound
            
            $('audio#background').removeAttr('loop');
            $('audio#background').attr('src', 'assets/sounds/Start_Musik.mp3');
            $('audio#background').get(0).addEventListener('ended', function startAudio() {
                $('audio#background').attr('src', 'assets/sounds/Start_Musik_Loop.mp3');
                $('audio#background').attr('loop', 'loop');
                $('audio#background').get(0).play();
                $('audio#background').get(0).removeEventListener('ended', startAudio);
            });
            $('audio#background').get(0).play();

        };

        var singlePlayer = function () {

            content = '<div class="container-fluid vertical-center-2" data-container="#main-center">' +
                '<div class="row" id="player-row">' +
                '<div class="col-lg-6 col-centered">' +
                '<div class="main-design">' +
                '<h1>Spielername</h1>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="row">' +
                '<div class="col-lg-6 col-centered">' +
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
                '<div class="col-lg-6 col-centered">' +
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
                '<div class="col-lg-5 pull-left">' +
                '<img src="assets/svgs/quzzeldull_logo_text_horizontal.svg" class="img-responsive" alt="Diamond Scope">' +
                '</div>' +
                '<div class="col-lg-4 pull-right">' +
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
                '<div class="col-lg-12 main-design">' +
                '<h1 id="question">Wie hei&szlig;t eine gängige Projektmanagement-Methode?</h1>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="container-fluid answer-box">' +
                '<div class="container-fluid">' +
                '<div class="col-md-12 rounded-div main-design answer" data-id="0">' +
                '<h4 id="tag-a" class="pull-left vertical-center-2 audience" data-container=".answer[data-id=0]">A</h4>' +
                '<h4 id="answer-a" class="vertical-center-2" data-container=".answer[data-id=0]">Duke1</h4>' +
                '</div>' +
                '<div class="col-md-12 rounded-div main-design answer" data-id="1">' +
                '<h4 id="tag-b" class="pull-left vertical-center-2 audience" data-container=".answer[data-id=1]">B</h4>' +
                '<h4 id="answer-b" class="vertical-center-2" data-container=".answer[data-id=1]">Prince2</h4>' +
                '</div>' +
                '<div class="col-md-12 rounded-div main-design answer" data-id="2">' +
                '<h4 id="tag-c" class="pull-left vertical-center-2 audience" data-container=".answer[data-id=2]">C</h4>' +
                '<h4 id="answer-c" class="vertical-center-2" data-container=".answer[data-id=2]">King4</h4>' +
                '</div>' +
                '<div class="col-md-12 rounded-div main-design answer" data-id="3">' +
                '<h4 id="tag-d" class="pull-left vertical-center-2 audience" data-container=".answer[data-id=3]">D</h4>' +
                '<h4 id="answer-d" class="vertical-center-2" data-container=".answer[data-id=3]">Queen3</h4>' +
                '</div>' +
                '</div>' +
                '<div class="row">' +
                '<div class="col-lg-2 pull-right rounded-div joker-button main-design" id="joker-audience">' +
                '<h4 class="vertical-center-2" data-container="#joker-audience">Publikum</h4>' +
                '</div>' +
                '<div class="col-lg-2 pull-right rounded-div joker-button main-design" id="joker-fifty">' +
                '<h4 class="vertical-center-2" data-container="#joker-fifty">50:50</h4>' +
                '</div>' +
                '</div>' +
                '</div>';

            $('#content-div').html(content);

        };

        var endScreen = function () {

            content = '<div class="container-fluid question-box">' +
                         '<div class="row">' +
                            '<div>' +
                                '<div class="col-lg-5 pull-left">' +
                                    '<img src="assets/svgs/quzzeldull_logo_text_horizontal.svg" class="img-responsive" alt="Diamond Scope">' +
                                '</div>' +
                            '</div>' +
                         '</div>' +
                        '</div>' +
                        '<div class="vertical-center-2" data-container="#main-center">' +
                            '<div class="row">' +
                                '<div class="col-lg-12 main-design">';
            
            content += game.conclude();
            
            content +=          '</div>' +
                            '</div>' +
                            '<div class="menu-button rounded-div main-design btn" id="new-game-button">' +
                                '<h1>Neue Runde</h1>' +
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
                                '<div class="col-lg-5 pull-left">' +
                                    '<img src="assets/svgs/quzzeldull_logo_text_horizontal.svg" class="img-responsive" alt="Diamond Scope">' +
                                '</div>' +
                            '</div>' +
                         '</div>' +
                        '</div>' +
                        '<div class="vertical-center-2" data-container="#main-center">' +
                            '<div class="row">' +
                                '<div class="col-lg-12 main-design">';
            
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
            
            var j, i, temp;
            var x = question.rightAnswer;
            for (i = 0; i < 4; i++) {
                j = Math.floor(Math.random() * (i + 1));
                if (j == x) {
                    question.rightAnswer = i;
                    x = i;
                } else if(i == x){
                    question.rightAnswer = j;
                    x = j;
                }
                temp = question.answers[i];
                question.answers[i] = question.answers[j];
                question.answers[j] = temp;
                temp = question.scrambledAnswers[i];
                question.scrambledAnswers[i] = question.scrambledAnswers[j];
                question.scrambledAnswers[j] = temp;
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
            $('#audience').html('.audience:after{opacity:0;}.audience{opacity:1;}');
            
            verticalAlign();
            
            //Voice
            var playVoice = function() {
                var audio = $('audio#voice').get(0);
                var $audio = $('audio#voice');
                var voicePath = 'assets/voices/voice';
                var fileType = '.mp3';

                $audio.attr('src', voicePath + question.id + '-q' + fileType);
                audio.addEventListener('ended', function audioQ() {
                    $audio.attr('src', voicePath + '-answer-a' + fileType);
                    audio.removeEventListener('ended', audioQ);
                    audio.addEventListener('ended', function audioA() {
                        $audio.attr('src', voicePath + question.id + '-' + question.scrambledAnswers[0] + fileType);
                        audio.removeEventListener('ended', audioA);
                        audio.addEventListener('ended', function audioZero() {
                            $audio.attr('src', voicePath + '-answer-b' + fileType);
                            audio.removeEventListener('ended', audioZero);
                            audio.addEventListener('ended', function audioB() {
                                $audio.attr('src', voicePath + question.id + '-' + question.scrambledAnswers[1] + fileType);
                                audio.removeEventListener('ended', audioB);
                                audio.addEventListener('ended', function audioOne() {
                                    $audio.attr('src', voicePath + '-answer-c' + fileType);
                                    audio.removeEventListener('ended', audioOne);
                                    audio.addEventListener('ended', function audioC() {
                                        $audio.attr('src', voicePath + question.id + '-' + question.scrambledAnswers[2] + fileType);
                                        audio.removeEventListener('ended', audioC);
                                        audio.addEventListener('ended', function audioTwo() {
                                            $audio.attr('src', voicePath + '-answer-d' + fileType);
                                            audio.removeEventListener('ended', audioTwo);
                                            audio.addEventListener('ended', function audioD() {
                                                $audio.attr('src', voicePath + question.id + '-' + question.scrambledAnswers[3] + fileType);
                                                audio.removeEventListener('ended', audioD);
                                                audio.addEventListener('ended', function audioThree() {
                                                    audio.pause();
                                                    audio.removeEventListener('ended', audioThree);
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
            }
            
            //End of Voice
            
            //Sound
            
            if(difficulty<2) {
                if(difficulty!=prediff) {
                    $('audio#background').attr('src', 'assets/sounds/Frage_Stufe_' + (difficulty+1) + '.mp3');
                    $('audio#background').attr('loop', 'loop');
                    $('audio#background').get(0).play();
                }
                playVoice();
            } else {
                $('audio#background').removeAttr('loop');
                $('audio#background').attr('src', 'assets/sounds/Frage_Income.mp3');
                $('audio#background').get(0).addEventListener('ended', function startAudio() {
                    playVoice();
                    $('audio#background').attr('src', 'assets/sounds/Frage_Stufe_' + (difficulty+1) + '.mp3');
                    $('audio#background').attr('loop', 'loop');
                    $('audio#background').get(0).play();
                    $('audio#background').get(0).removeEventListener('ended', startAudio);
                });
                $('audio#background').get(0).play();
            }
            prediff = difficulty;
            
            //End of Sound
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
                    verticalAlign();
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
        sizeCheck: sizeCheck,
    }

})();

$(function () {
    $(window).load(function () {
        
        $('body, *').css('font-weight', 100);
        
        DiamondScope.sizeCheck();
        $('audio#background').get(0).volume = 0.05;
        $('audio#event').get(0).volume = 0.2;

        setTimeout(function () {

            $('body > #loading').css('opacity', '0');

            setTimeout(function () {
                $('body > #loading').remove();
            }, 1001);

        }, 1500);
    });

    DiamondScope.init();
});