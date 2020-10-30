(function(window) {

    localStorage.setItem("quickTip", "stop");

    var key_language = (localStorage.getItem("key_language") != null) ? localStorage.getItem("key_language") : "RU";

    SetLaguage(key_language, function(ame_words) {

        if(window.ameChatSiteObject === undefined) {

            (window.ameChatSiteGroups = window.ameChatSiteGroups||[])["main"] = { group: "main", version:"0_3", uri:"ame.im" };

            var ameChatSiteObject = {},
                activeTabId = '',
                url = '',
                title = '',
                apiOrigin = 'https://i.ame.im/',
                background = {
                    'login': '',
                    'key' : '',
                    'id_guide': '' ,
                    'steps_url': []
                };
            
            var night_bool = false;

            if(localStorage.getItem("night_bool") != null) {

                night_bool = (localStorage.getItem("night_bool") === "true") ? true : false;
            }
            
            getBrowserRuntime().onMessage.addListener(function(request, sender, sendResponse) { 

                if(request.exist == true && request.end == false) {

                    ameChatSiteObject.templateMessage('Можешь приступать к созданию сценария', false);
                    sendResponse({ farewell: "start" });
                } 

                if(request.exist == true && request.end == true) {
                    sendResponse({farewell: "goodbye"});
                    guide = jQuery.parseJSON(request.data);

                    if(guide.steps.length > 0) 
                        ameChatSiteObject.templateMessage ( 'Завершено - твой сценарий:'+  request.data, false );
                    else ameChatSiteObject.templateMessage('Сценарий пуст', false );
                } 
            });

            ameChatSiteObject.init = function() {

                var needJQueryVersion = '3.4.1';

                if(window.ameChatSiteJQuery === undefined) {

                    if(this.testJQueryVersion(needJQueryVersion)) {

                        ameChatSiteJQuery = window.jQuery;
                        this.startWithJQuery();
                    }

                    else {
                        alert('Error');
                        window.close();
                    }
                }
            };
            
            ameChatSiteObject.noConflictDefineJQuery = function() {
                ameChatSiteJQuery = window.jQuery.noConflict(true);
                this.startWithJQuery();
            };
            
            // При загрузке страницы
            ameChatSiteObject.startWithJQuery = function() {

                var defaultData = {
                    group: 'test',
                    version: '0_3',
                    head: 'Ame-chat',
                    msgHi: ame_words.messageHi,
                    apiHost1: apiOrigin + 'bot/getAnswer?callback=?',
                    apiHost2: apiOrigin + 'bot/getTip?callback=?',
                    apiHost3: apiOrigin + 'bot/getTooltip?callback=?',
                }
                ameChatSiteObjectThis = this,
                thisData = {};

                getBrowserRuntime().sendMessage({background: true}, function(response) {

                    background = response; 

                    for(var ameObject in ameChatSiteGroups) {

                        ameChatSiteJQuery.each(defaultData, function(key2, value2) {

                            thisData[key2] = (ameChatSiteGroups[ameObject][key2] === undefined) ? value2 : ameChatSiteGroups[ameObject][key2];
                        });

                        ameChatSiteObjectThis.data = thisData;
                        
                        if(!ameChatSiteJQuery('div').is('#amechatsite' + ameChatSiteObjectThis.data.group)) ameChatSiteObjectThis.createHtmlForm();
                        
                        ameChatSiteObjectThis.createController();

                        var button_shift = document.getElementsByClassName("button-shift")[0];

                        // Проверяем кнопку
                        if(night_bool) button_shift.setAttribute("class", "button-shift button-shift-active");

                        else button_shift.setAttribute("class", "button-shift");

                        // Проверяем вход
                        if(background.login == '') ameChatSiteObject.templateLogOutHead();
                        
                        else ameChatSiteObject.templateLogInHead(background.login);

                        // Устанавливаем тему
                        ameChatSiteObject.theme(night_bool);

                        getBrowser().tabs.executeScript(ameChatSiteObjectThis.activeTab(), {code:  'exist = typeof array_enjoy;'}, function(res) {

                            ameChatSiteObject.templateMessage(ameChatSiteObject.data.msgHi + background.login + '?', false);

                        });
                    }
                });
            };    

            ameChatSiteObject.testJQueryVersion = function(needVersion, strictly = false) {

                if(window.jQuery === undefined || (strictly === true && window.jQuery.fn.jquery != needVersion)) return false;

                var currentVersionArray = ( window.jQuery.fn.jquery ).split( '.' ), needVersionArray = needVersion.split( '.' );

                for (var i = 0; i < currentVersionArray.length; i++) {

                    if(needVersionArray[i] !== undefined && parseInt(needVersionArray[i]) > parseInt(currentVersionArray[i])) return false;

                    else if (needVersionArray[i] === undefined || parseInt (needVersionArray[i]) < parseInt (currentVersionArray[i])) return true;
                }

                return true;
            };
            
            // Загрузка jquery (или любой другой библиотеки через ссылку lib)
            ameChatSiteObject.loadlib = function(lib, functionOnReady, async=false) {

                var scriptTag = document.createElement ('script');
                scriptTag.src = lib;
                scriptTag.async = async;
                scriptTag.onload = functionOnReady;
                scriptTag.onreadystatechange = function () { 

                    if(this.readyState == 'complete' || this.readyState == 'loaded') {
                        functionOnReady();
                    }
                };

                (document.getElementsByTagName('head')[0] || document.documentElement).appendChild(scriptTag); // WHY 2?
            };
            
            // GET Ajax Отправить запрос
            ameChatSiteObject.sendAjax = function(parametrs, host, functionBeforeSend, functionSuccess, functionError) {

                ameChatSiteJQuery.ajax({
                    url: host,
                    type: 'GET',
                    dataType: 'jsonp',
                    data: parametrs,
                    beforeSend: function() { functionBeforeSend(); },
                    success: function(data) { functionSuccess(data); },
                    error: function(data) { functionError(data); }
                });
            };

            // TEMPLATE сообщения
            ameChatSiteObject.templateMessage = function(msg, out = false, tip = null) {

                // Сообщение
                ameChatSiteJQuery('<div class="' + (out ? 'amechatsiteMsgsXSet' : 'amechatsiteMsgsXGet') + '"><div class="' + (out ? 'amechatsiteMsgsSet' : 'amechatsiteMsgsGet') + '">' + msg + '</div></div>').appendTo('#amechatsite' + this.data.group + ' .amechatsiteMsgs');

                // Анимационное пролистывание
                ameChatSiteJQuery('.amechatsiteMsgs').animate({ scrollTop: ameChatSiteJQuery('.amechatsiteMsgs').prop("scrollHeight") }, 500);
            };

            // TEMPLATE любой кнопки
            ameChatSiteObject.templateButton = function(msg, btnClass, tip = null) {

                tipBtn = (tip == null? '<button type="button" class="btn btn-outline-primary btn-chat btn-'+btnClass+'">'+msg+'</button>': '<button type="button" class="btn btn-outline-primary btn-'+btnClass+'" data-id="'+tip+'">'+msg+'</button>');
                ameChatSiteJQuery(tipBtn).appendTo ('#amechatsite' + this.data.group + ' .amechatsiteMsgs');
            };

            // TEMPLATE шапки и меню авторизованного
            ameChatSiteObject.templateLogInHead = function(name) {

                let templateHead = `
                <img src="assets/img/logo_ame.png" alt="Ame" style="width: 91px;">
                <div class="amechatbtnlogin">
                    <div type="button" class="amechatbtnMenu"></div>
                </div>`;

                let templateUser = `
                    <div class="left"><img src="assets/img/user.png" alt="User"> <a href="https://i.ame.im/settings">` + name + `</a></div>
                    <div class="right"><a href="#" id="btnLogOut">` + ame_words.buttonLogOut + `</a></div>
                `;

                $(".amechatsiteMenu-user").html(templateUser);

                $(".amechatsiteHead-main").html(templateHead);
            };

            // TEMPLATE шапки и меню неавторизованного
            ameChatSiteObject.templateLogOutHead = function() {

                let templateHead = `
                <img src="assets/img/logo_ame.png" alt="Ame" style="width: 91px;">
                <div class="amechatbtnlogin">
                    <button type="button" class="amechatbtnloginloginBt btLogInPage">` + ame_words.buttonMenuLogIn + `</button>
                    <div type="button" class="amechatbtnMenu"></div>
                </div>`;

                let templateUser = `
                    <div class="left"><img src="assets/img/user.png" alt="User"> ` + ame_words.textUserLogOut + `</div>
                    <div class="right"><a href="#" class="btLogInPage">` + ame_words.linkLogIn + `</a></div>
                `;

                $(".amechatsiteMenu-user").html(templateUser);

                $(".amechatsiteHead-main").html(templateHead);
            };

            // Отправить сообщение
            ameChatSiteObject.Send = function() {

                var ameChatSiteObjectThis = this,
                    msg = ameChatSiteJQuery('#amechatsite' + ameChatSiteObjectThis.data.group + ' .amechatsiteFieldInput').val();

                var input = ameChatSiteJQuery(".amechatsiteFieldInput");
                var button = ameChatSiteJQuery(".amechatsiteFieldSend");

                if(msg !== '') {

                    ameChatSiteObjectThis.sendAjax('msg=' + msg + '&url='+ encodeURIComponent(url) + background.key + '&utm=' + encodeURIComponent(ameChatSiteObjectThis.getUtm('utm_term')), ameChatSiteObjectThis.data.apiHost1,

                    // beforSend
                    function() {

                        input.attr("placeholder", "Идет отправка...");
                        input.prop("disabled", true);
                        input.val('');
                        button.css("background", "url(/assets/img/loader.svg) no-repeat center center");
                        button.css("background-size", "70%");
                    }, 

                    // success
                    function(data) {

                        input.attr("placeholder", "Введите сообщение");
                        input.prop("disabled", false);
                        input.val('');
                        button.css("background", "url(/assets/img/send.png) no-repeat center center");
                        button.css("background-size", "45%");

                        ameChatSiteObjectThis.templateMessage(msg, true);

                        ameChatSiteObjectThis.templateMessage(data.msg, false, data.tip);

                        if(data.tip != null) {

                            if(data.tip != 'forwarding'){

                                if(data.tip != '5') ameChatSiteObjectThis.templateButton('Могу показать как','tip', data.tip);

                                else if (data.user.id > 0) ameChatSiteObjectThis.templateButton('Начать составление сценария', 'start-tip');

                                else ameChatSiteObjectThis.templateButton('Авторизация', 'login');

                            }else{
                                console.log(data.url);
                            }
                        }

                        if(data.tooltip != null) ameChatSiteObjectThis.showTooltip(data.tooltip);

                        $(".amechatsiteFieldInput").focus();
                    },

                    // error
                    function(data) { alert('Error!1'); });
                }
            };

            ameChatSiteObject.showTip = function(id) {

                var ameChatSiteObjectThis = this;

                ameChatSiteObjectThis.sendAjax('id=' + id + background.key, ameChatSiteObjectThis.data.apiHost2, 

                // beforSend
                function() {},

                // success
                function(data) {

                    if(data.user.id > 0 && data.guide.tip != null) {

                        background.id_guide = id;
                        background.steps_url.length = 0;
                        $.each(data.guide.tip.steps,function(i,v) {
                            background.steps_url.push(v.url); 
                        });

                        console.log(background.steps_url);
                        getBrowserRuntime().sendMessage({background: true, id_guide: id, steps_url: background.steps_url}, function(date) { 
                            background = data; 
                            console.log(background);
                        });

                        getBrowser().cookies.set({
                            url: apiOrigin ,
                            name: "ame_step_extension",
                            value: '0',
                            domain: '.ame.im',
                            path: '/',
                            secure: true
                        }); 

                        getBrowser().tabs.insertCSS(activeTabId,{file:"/assets/css/quicktip.css"});

                        getBrowser().tabs.executeScript(activeTabId, { file: "/assets/js/jquery-3.4.1.min.js" }, function() {
                            getBrowser().tabs.executeScript(activeTabId, { file: "/assets/js/quick_library/quick_library.js" }, function() {
                                getBrowser().tabs.executeScript(activeTabId, { code:  'var array_enjoy = ' + ameChatSiteObjectThis.htmlDecode(JSON.stringify(data.guide.tip)) }, function() {
                                    getBrowser().tabs.executeScript(activeTabId, {code:  'var step =  0 ;' }, function(){
                                        getBrowser().tabs.executeScript(activeTabId, { file: "/assets/js/hint.js" });
                                        window.close();
                                    });
                                });
                            });
                        });
                    } 
                    
                    else ameChatSiteObjectThis.templateMessage(data.msg, true);
                },

                // error
                function(data) { alert('Error!2'); });      
            };

            ameChatSiteObject.getTooltip = function() {

                var ameChatSiteObjectThis = this;

                ameChatSiteObjectThis.sendAjax('site=' + url + background.key, ameChatSiteObjectThis.data.apiHost3,

                // beforSend
                function() {},

                // success
                function(data) {

                    if(data.tooltip != null) ameChatSiteObjectThis.showTooltip(data.tooltip);
                    
                    else ameChatSiteObjectThis.templateMessage(data.msg_tooltip, true);
                },

                // error
                function(data) {  alert('Error!3'); });      
            };

            ameChatSiteObject.showTooltip = function(tooltips) {

                var ameChatSiteObjectThis = this;

                getBrowser().tabs.executeScript(activeTabId, {file: "/assets/js/jquery-3.4.1.min.js"}, function(){

                    $.each(tooltips, function(index,value) {
                        $.each(value.tip.page, function(i,v) {
                            getBrowser().tabs.executeScript(activeTabId, {code:'$("'+v.object+'").attr("ame-hint","'+ v.description+'");'});
                        });
                    });

                    getBrowser().tabs.insertCSS(activeTabId, {file: "/assets/css/tooltip.css"}, function() {

                        ameChatSiteObjectThis.templateMessage ( 'Подсказки уже на странице и будут там до перезагрузки', true );
                    });
                });

            };

            ameChatSiteObject.startTip = function() {

                getBrowser().tabs.insertCSS(activeTabId, { file:"/assets/css/quicktip.css" });

                getBrowser().tabs.executeScript(activeTabId, { file: "/assets/js/jquery-3.4.1.min.js"}, function() {
                    getBrowser().tabs.executeScript(activeTabId, { file: "/assets/js/quick_library/quick_library.js"}, function() {
                        getBrowser().tabs.executeScript(activeTabId, { file: "/assets/js/startHint.js" });
                        window.close();
                    });
                });
            };

            ameChatSiteObject.getUtm = function(name) {

                var name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
                var results = regex.exec(url);
                return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            }

            ameChatSiteObject.startQuickTip = function() {

                let preloader = `
                    <div class="quick-preloader">
                        <div class="quick-preloader-container">
                        <div class="quick-preloader-box1"></div>
                        <div class="quick-preloader-box2"></div>
                        <div class="quick-preloader-box3"></div>
                        </div>
                    </div> 
                `;

                let template = `
                    <div class="quick_tip_block" style="box-shadow: 5px 5px 10px 2px black;">

                        <!-- Хвостик темплейта -->
                        <div id="quickTip_tail" class="quick_tip_tail"></div>

                        <div class="quick_tip_head">
                            <div id="quickTip_title" class="quick_tip_title">Меню</div>
                            <div class="quick_tip_indicator">
                            <i id="quickTip_previous" class="fa fa-chevron-left" aria-hidden="true"></i>
                            <span id="quickTip_indicator">1 из 3</span>
                            </div>
                        </div>
                        <div id="quickTip_text" class="quick_tip_text">Кнопка фхода, нужна для того чтобы войти</div>
                        <div class="quick_tip_footer">
                            <a href="#" id="quickTip_stop">Пропустить</a>
                            <button id="quickTip_next">Далее</button>
                        </div>
                    </div>
                `;

                if(localStorage.getItem("quickTip") === null || localStorage.getItem("quickTip") === "stop") {

                    let quickTip = new QuickTip(template, {
                        onStart: function() { localStorage.setItem("quickTip", "start"); },
                        onEnd: function() { localStorage.setItem("quickTip", "stop"); },
                        onSkip: function() { localStorage.setItem("quickTip", "stop"); }
                    });

                    quickTip.setPreloader(preloader);

                    quickTip.set([
                        {
                            object: ".quickTip-bot:eq(0)",
                            title: 'Чат',
                            text: 'Здесь происходит все взаимодействие с ботом',
                            offset: { left: 0, top: -90 },
                            buttonPreviousActive: false,
                            onStep: function() { ameChatSiteObject.closeMenu(); }
                        },
                        {
                            object: ".quickTip-input",
                            title: 'Поле ввода',
                            text: 'Здесь вы можете ввести интересуещее вас сообщение',
                            onStep: function() { ameChatSiteObject.closeMenu(); }
                        },
                        {
                            object: ".quickTip-user",
                            title: 'Аутентификация',
                            text: 'Здесь отображается авторизованы вы или нет',
                            delay: 215,
                            onStep: function() { ameChatSiteObject.openMenu(); }
                        },
                        {
                            object: ".quickTip-night",
                            title: 'Ночной режим',
                            text: 'Позволяет сменить оформление чата',
                            triggerActive: false
                        },
                        {
                            object: ".quickTip-language",
                            title: 'Язык',
                            text: 'Открывает меню с доступными языками',
                            delay: 215,
                            onStep: function() { ameChatSiteObject.openMenu(); }
                        },
                        {
                            object: ".quickTip-end",
                            title: 'Завершение',
                            text: 'Желаем вам продуктивности и удачи',
                            button_next: "Завершить",
                            buttonStopActive: false,
                            tailActive: false,
                            offset: { left: 0, top: -90 },
                            onStep: function() { ameChatSiteObject.closeMenu(); }
                        }
                    ]);

                    quickTip.run();
                }
            }

            // Открыть меню
            ameChatSiteObject.openMenu = function() {

                $('.amechatsiteMenu').css("right","0px");
            };

            // Закрыть меню
            ameChatSiteObject.closeMenu = function() {

                $('.amechatsiteMenu').css("right","-350px");
                $(".amechatsiteFieldInput").focus();
            };

            // Открыть меню Language
            ameChatSiteObject.openMenuLanguage = function() {

                $('.amechatsiteMenuLanguage').css("right","0px");
            };

            // Закрыть меню Language
            ameChatSiteObject.closeMenuLanguage = function() {

                $('.amechatsiteMenuLanguage').css("right","-350px");
            };

            // Страница входа
            ameChatSiteObject.pageLogIn = function() {

                // Форма логина
                $('.login-form').css("display", "flex");

                // Форма чата
                $('.amechatsite').css("display", "none");

                // Форма регистрации
                $('.reg-form').css("display", "none");

                // Форма восстановления
                $('.recovery-form').css("display", "none");

                // Форма сообщения о восстановлении
                $('.recovery-form-ok').css("display", "none");

                // Форма сообщения о успешной регистрации
                $('.reg-form-ok').css("display", "none");

                ameChatSiteObject.closeMenu();
            };

            // Страница чат бот
            ameChatSiteObject.pageChat = function() {

                // Форма логина
                $('.login-form').css("display", "none");

                // Форма чата
                $('.amechatsite').css("display", "flex");

                // Форма регистрации
                $('.reg-form').css("display", "none");

                // Форма восстановления
                $('.recovery-form').css("display", "none");

                // Форма сообщения о восстановлении
                $('.recovery-form-ok').css("display", "none");

                // Форма сообщения о успешной регистрации
                $('.reg-form-ok').css("display", "none");

                $(".amechatsiteFieldInput").focus();

                ameChatSiteObject.closeMenu();
            };

            // Страница регистрации
            ameChatSiteObject.pageRegistration = function() {

                // Форма логина
                $('.login-form').css("display", "none");

                // Форма чата
                $('.amechatsite').css("display", "none");

                // Форма регистрации
                $('.reg-form').css("display", "flex");

                // Форма восстановления
                $('.recovery-form').css("display", "none");

                // Форма сообщения о восстановлении
                $('.recovery-form-ok').css("display", "none");

                // Форма сообщения о успешной регистрации
                $('.reg-form-ok').css("display", "none");

                ameChatSiteObject.closeMenu();
            };

            // Страница восстановления
            ameChatSiteObject.pageRecovery = function() {

                // Форма логина
                $('.login-form').css("display", "none");

                // Форма чата
                $('.amechatsite').css("display", "none");

                // Форма регистрации
                $('.reg-form').css("display", "none");

                // Форма восстановления
                $('.recovery-form').css("display", "flex");

                // Форма сообщения о восстановлении
                $('.recovery-form-ok').css("display", "none");

                // Форма сообщения о успешной регистрации
                $('.reg-form-ok').css("display", "none");

                ameChatSiteObject.closeMenu();
            };

            // Форма сообщения о успешном восстановлении
            ameChatSiteObject.pageRecoveryMessage = function() {

                // Форма логина
                $('.login-form').css("display", "none");

                // Форма чата
                $('.amechatsite').css("display", "none");

                // Форма регистрации
                $('.reg-form').css("display", "none");

                // Форма восстановления
                $('.recovery-form').css("display", "none");

                // Форма сообщения о восстановлении
                $('.recovery-form-ok').css("display", "flex");

                // Форма сообщения о успешной регистрации
                $('.reg-form-ok').css("display", "none");

                ameChatSiteObject.closeMenu();
            };

            // Форма сообщения о успешной регистрации
            ameChatSiteObject.pageRegistrationMessage = function() {

                // Форма логина
                $('.login-form').css("display", "none");

                // Форма чата
                $('.amechatsite').css("display", "none");

                // Форма регистрации
                $('.reg-form').css("display", "none");

                // Форма восстановления
                $('.recovery-form').css("display", "none");

                // Форма сообщения о восстановлении
                $('.recovery-form-ok').css("display", "none");

                // Форма сообщения о успешной регистрации
                $('.reg-form-ok').css("display", "flex");

                ameChatSiteObject.closeMenu();
            };

            // Восстановление пароля
            ameChatSiteObject.recoveryPass = function() {

                $('#btnRecoveryPass').attr('disabled', 'disabled');

                // Если Данные введены
                if($('#field-email-recovery').val() != '') {

                    var json = {};
                    json.email = $('#field-email-recovery').val();
                    
                    $.get(apiOrigin + "settings/recoveryPass", json, function(data) {

                        obj = jQuery.parseJSON(JSON.stringify(data));

                        // Если нет ошибки
                        if(obj.errors == undefined) {

                            // Очищаем поле ошибок
                            $('.errors-recovery').html("");
                            $('#btnRecoveryPass').removeAttr('disabled');

                            // Форма сообщения о восстановлении
                            ameChatSiteObject.pageRecoveryMessage();
                        }
                        
                        // Если есть ошибки
                        else {

                            $('.errors-recovery').html('<p>'+ obj.errors +'</p>');
                            $('#btnRecoveryPass').removeAttr('disabled');
                        }
                    });
                }
                
                // Если Данные не введены
                else {

                    $('.errors-recovery').html('<p class="errorTextRecoveryPageNull">' + ame_words.errorTextRecoveryPageNull + '</p>');
                    $('#btnRecoveryPass').removeAttr('disabled');
                }
            };

            // Регистрация
            ameChatSiteObject.registration = function() {

                $('#btnReg').attr('disabled', 'disabled');

                var email = $('#field-email-reg').val();
                var password1 = $('#field-password-reg').val();
                var password2 = $('#field-password-again-reg').val();

                // Проверям пароли
                if(password1 == password2) {

                    // Проверям поля на пустоту
                    if(email != '' && password1 != '') {

                        // Проверяем согласие
                        if(ameChatSiteObject.сonsentCheck()) {

                            var json = {};
                            json.email = email;
                            json.password = password1;
                            
                            $.get(apiOrigin + "registration", json, function(data) {

                                obj = jQuery.parseJSON(JSON.stringify(data));

                                if(obj.errors == undefined) {

                                    if(obj.add.status == 'ok') {

                                        getBrowser().cookies.set({
                                            url: apiOrigin ,
                                            name: "security_token_admin",
                                            value: obj.user.token,
                                            domain: obj.user.domain,
                                            path: '/',
                                            secure: true
                                        });  

                                        // Обнуляем все поля
                                        $('#field-phone-reg').val('');
                                        $('#field-password-reg').val('');
                                        $('#field-password-again-reg').val('');

                                        // Очищаем поле ошибок
                                        $('.errors-reg').html("");
                                        $('#btnReg').removeAttr('disabled');

                                        // Форма сообщения о успешной регистрации
                                        ameChatSiteObject.pageRegistrationMessage();
                                    }
                                } 
                                
                                else {

                                    $('.errors-reg').html('<p>'+ obj.errors +'</p>'); 
                                    $('#btnReg').removeAttr('disabled');
                                } 
                            });
                        }

                        else {

                            $('.errors-reg').html('<p class="errorTextRegistrtionPagePrivacyPolicy">' + ame_words.errorTextRegistrtionPagePrivacyPolicy + '</p>');
                            $('#btnReg').removeAttr('disabled');
                        }
                    }   
                    
                    else {

                        $('.errors-reg').html('<p class="errorTextRegistrtionPageNull">' + ame_words.errorTextRegistrtionPageNull + '</p>');
                        $('#btnReg').removeAttr('disabled');
                    }
                } 
                
                else {

                    $('.errors-reg').html('<p class="errorTextRegistrtionPagePass">' + ame_words.errorTextRegistrtionPagePass + '</p>');
                    $('#btnReg').removeAttr('disabled');
                }
            };

            // Клик на Согласие
            ameChatSiteObject.сonsentClick = function() {

                var input = document.getElementById("checkbox-input");

                var checkbox = document.getElementById("checkbox-input-checkboxborder");

                var activebox = document.getElementById("checkbox-input-checkboxborderactive");

                // Если галка стоит
                if(input.checked) { 

                    checkbox.setAttribute("class", "checkboxborder");
                    activebox.setAttribute("class", "checkboxborderactive checkboxborderactive-active");
                    $('.errors-reg').html("");
                }

                else {

                    checkbox.setAttribute("class", "checkboxborder errorchecked");
                    activebox.setAttribute("class", "checkboxborderactive");
                    $('.errors-reg').html('<p class="errorTextRegistrtionPagePrivacyPolicy">' + ame_words.errorTextRegistrtionPagePrivacyPolicy + '</p>');
                }
            }

            // Проверка согласия
            ameChatSiteObject.сonsentCheck = function() {

                var checkbox = document.getElementById("checkbox-input");
            
                return (checkbox.checked) ? bool = true : bool = false;
            }

            // Вход
            ameChatSiteObject.logIn = function() {

                $('#btnLogin').attr('disabled', 'disabled');

                var email = $('#field-email').val();
                var password = $('#field-password').val();

                // Проверка полей
                if(email != '' && password != '') {

                    var json = {};
                    json.email = email;
                    json.password = password;
                    
                    $.get(apiOrigin + "login", json, function(data) {

                        obj = jQuery.parseJSON(JSON.stringify(data));

                        // Если нет ошибок
                        if(obj.errors == undefined) {

                            getBrowser().cookies.set({
                                url: apiOrigin,
                                name: "security_token_admin",
                                value: obj.user.token,
                                domain: "."+obj.user.domain,
                                path: '/',
                                secure: true
                            });

                            $('#btnLogin').removeAttr('disabled');

                            ameChatSiteObject.templateLogInHead(json.email);
                            ameChatSiteObject.pageChat();
                        } 
                        
                        else {

                            $('.errors').html('<p class="errorTextLogInPageUser">' + ame_words.errorTextLogInPageUser + '</p>');
                            $('#btnLogin').removeAttr('disabled');
                        } 
                    });
                } 
                
                else {

                    $('.errors').html('<p class="errorTextLogInPageNull">' + ame_words.errorTextLogInPageNull + '</p>');
                    $('#btnLogin').removeAttr('disabled');
                }
            };

            // Выход
            ameChatSiteObject.logOut = function() {

                $.get(apiOrigin + 'pa/logout?callback=?', {}, function() {

                    getBrowser().cookies.remove({url: apiOrigin, name: "security_token_admin"});

                    ameChatSiteObject.templateLogOutHead();

                    ameChatSiteObject.pageChat();

                    window.close();
                });
            };
            
            // Клик на кнопку ночного режима
            ameChatSiteObject.nightButtonClick = function() {

                var button_shift = document.getElementsByClassName("button-shift")[0];

                if(night_bool) { button_shift.setAttribute("class", "button-shift"); night_bool = false; ameChatSiteObject.theme(night_bool); }

                else { button_shift.setAttribute("class", "button-shift button-shift-active"); night_bool = true; ameChatSiteObject.theme(night_bool); }
            };

            // Ночной режим
            ameChatSiteObject.theme = function(night_bool) {

                // Если ночной режим
                if(night_bool) {

                    $(':root').css("--background", "#141A3C");
                    $(':root').css("--color", "#fff");
                    $(':root').css("--link", "#fff");
                    $(':root').css("--shadow-send-input", "rgba(0,129,238, 1)");
                }

                // Если нет
                else {

                    $(':root').css("--background", "#fff");
                    $(':root').css("--color", "#000");
                    $(':root').css("--link", "#0000EE");
                    $(':root').css("--shadow-send-input", "rgba(50, 50, 50, 0.5)");
                }

                localStorage.setItem("night_bool", night_bool);
            };

            ameChatSiteObject.closeTip = function() {

                background.exitTip();

                getBrowser().tabs.executeScript(activeTabId, {code: 'array_enjoy = []'}, function(){
                    getBrowser().tabs.reload(activeTabId);
                });
            };

            ameChatSiteObject.activeTab = function() {

                getBrowser().tabs.query({ currentWindow: true, active: true }, function (tabArray) {
                    activeTabId =  tabArray[0].id;
                    url = tabArray[0].url;
                    title = tabArray[0].title;
                    return activeTabId;
                });
            }

            // КОНТРОЛЛЕР
            ameChatSiteObject.createController = function() {

                var ameChatSiteObjectThis = this;

                // ПОДСКАЗКА Клики на кнопку вопросик
                ameChatSiteJQuery('body').on('click', ".btn-tooltip", function() { ameChatSiteObject.startQuickTip();  });
                
                // ПОДСКАЗКА
                ameChatSiteJQuery('body').on('click', ".btn-tip", function() { ameChatSiteObject.showTip($(this).attr('data-id')); });

                // ПОДСКАЗКА
                ameChatSiteJQuery('body').on('click', ".btn-start-tip", function() { ameChatSiteObject.startTip(); });

                // ПОДСКАЗКА
                ameChatSiteJQuery('body').on('click', ".btn-close", function() { ameChatSiteObject.closeTip(); });

                // ЧАТ БОТ переход на страницу чата
                ameChatSiteJQuery('body').on('click', ".chatBotPage", function() { ameChatSiteObject.pageChat(); });

                // ВХОД переход на страницу входа
                ameChatSiteJQuery('body').on('click', ".btLogInPage", function() { ameChatSiteObject.pageLogIn(); });

                // ВХОД
                ameChatSiteJQuery('body').on('click', "#btnLogin", function() { ameChatSiteObject.logIn(); });

                // ВЫХОД
                ameChatSiteJQuery('body').on('click', "#btnLogOut", function() { ameChatSiteObject.logOut(); });

                // РЕГИСТРАЦИЯ Переход на страницу регистрации
                ameChatSiteJQuery('body').on('click', "#btnRegPage", function() { ameChatSiteObject.pageRegistration(); });

                // РЕГИСТРАЦИЯ
                ameChatSiteJQuery('body').on('click', "#btnReg", function() { ameChatSiteObject.registration(); });

                // ВОССТАНОВЛЕНИЕ Переход на страницу восстановления
                ameChatSiteJQuery('body').on('click', "#recoveryPage", function() { ameChatSiteObject.pageRecovery(); });

                // ВОССТАНОВЛЕНИЕ
                ameChatSiteJQuery('body').on('click', "#btnRecoveryPass", function() { ameChatSiteObject.recoveryPass(); });

                // ОТКРЫТЬ МЕНЮ
                ameChatSiteJQuery('body').on('click', ".amechatbtnMenu", function() { ameChatSiteObject.openMenu(); });

                // ЗАКРЫТЬ МЕНЮ
                ameChatSiteJQuery('body').on('click', ".amechatsiteMenu-closeMenu", function() { ameChatSiteObject.closeMenu(); });

                // ОТКРЫТЬ МЕНЮ LANGUAGE
                ameChatSiteJQuery('body').on('click', ".amechatbtnMenuLanguage", function() { ameChatSiteObject.openMenuLanguage(); });

                // ЗАКРЫТЬ МЕНЮ LANGUAGE
                ameChatSiteJQuery('body').on('click', ".amechatsiteMenuLanguage-closeMenu", function() { ameChatSiteObject.closeMenuLanguage(); });

                // НОЧНОЙ РЕЖИМ
                ameChatSiteJQuery('body').on('click', ".button-shift", function() { ameChatSiteObject.nightButtonClick(); });

                // СОГЛАСИЕ
                ameChatSiteJQuery('body').on('click', "#checkbox-input", function() { ameChatSiteObject.сonsentClick(); });
                
                // СМЕНИТЬ ЯЗЫК RU
                ameChatSiteJQuery('body').on('click', ".linkLanguageRU", function() { localStorage.setItem("key_language", "RU"); document.location.reload(true); });

                // СМЕНИТЬ ЯЗЫК EN
                ameChatSiteJQuery('body').on('click', ".linkLanguageEN", function() { localStorage.setItem("key_language", "EN"); document.location.reload(true); });

                // СОБЫТИЕ отправить сообщение в чате
                ameChatSiteJQuery('body').on('click', ".amechatsiteFieldSend", function() { ameChatSiteObjectThis.Send(); });

                // СОБЫТИЕ нажатие на ENTER
                ameChatSiteJQuery('#amechatsite' + ameChatSiteObjectThis.data.group + ' .amechatsiteFieldInput').keypress(function(e) { if(e.which == 13) { ameChatSiteObjectThis.Send(); return false; } });
            };

            ameChatSiteObject.htmlDecode = function(input) {

                var doc = new DOMParser().parseFromString(input.replace(/&quot;/g, '\\"'), "text/html");
                return doc.documentElement.textContent;
            }
        }

        ameChatSiteObject.init();

        function getBrowser() {

            if(typeof browser === "undefined") return chrome;
            
            else return browser;
        }
        
        function getBrowserRuntime() {
            
            if(typeof browser === "undefined") return chrome.extension;
            
            else return browser.runtime;   
        }

        function getBrowserExtension() {
            
            if(typeof browser === "undefined") return chrome.extension;
            
            else return browser.extension;   
        }

        window.ameChatSiteObject = ameChatSiteObject;
    });

    function SetLaguage(key, callback) {

        if(key === "RU") $.getJSON("languageRU.json", function(json) { SetWords(json); callback(json, key); });

        if(key === "EN") $.getJSON("languageEN.json", function(json) { SetWords(json); callback(json, key); });
    }

    function SetWords(words) {

        $(".buttonMenuLogIn").html(words.buttonMenuLogIn);

        $(".buttonLogIn").html(words.buttonLogIn);

        $(".buttonLogOut").html(words.buttonLogOut);

        $(".buttonRegistration").html(words.buttonRegistration);

        $(".buttonRecoveryPass").html(words.buttonRecoveryPass);

        $(".buttonRecoveryOk").html(words.buttonRecoveryOk);

        $(".textUserLogOut").html(words.textUserLogOut);

        $(".textNight").html(words.textNight);

        $(".textLanguage").html(words.textLanguage);

        $(".textLogInPageTitle").html(words.textLogInPageTitle);

        $(".textLogInPageRecovery").html(words.textLogInPageRecovery);

        $(".textRegistrtionPageTitle").html(words.textRegistrtionPageTitle);

        $(".textRegistrtionPagePrivacyPolicyStart").html(words.textRegistrtionPagePrivacyPolicyStart);

        $(".textRegistrtionPagePrivacyPolicyAnd").html(words.textRegistrtionPagePrivacyPolicyAnd);

        $(".textRecoveryPageTitle").html(words.textRecoveryPageTitle);

        $(".textRecoveryPageText").html(words.textRecoveryPageText);

        $(".textRegistrationPageOkText").html(words.textRegistrationPageOkText);

        $(".textRecoveryPageOkText").html(words.textRecoveryPageOkText);

        $(".placeholderSendMessage").attr("placeholder", words.placeholderSendMessage);
        
        $(".placeholderMail").attr("placeholder", words.placeholderMail);

        $(".placeholderPass").attr("placeholder", words.placeholderPass);

        $(".placeholderRePass").attr("placeholder", words.placeholderRePass);

        $(".linkLogIn").html(words.linkLogIn);

        $(".linkLanguage").html(words.linkLanguage);

        $(".linkWhatTheAme").html(words.linkWhatTheAme);

        $(".linkPrivacyPolicy").html(words.linkPrivacyPolicy);

        $(".linkTermsOfUse").html(words.linkTermsOfUse);

        $(".linkRecovery").html(words.linkRecovery);

        $(".linkRegistrationPrivacyPolicy").html(words.linkRegistrationPrivacyPolicy);

        $(".linkRegistrationTermsOfUse").html(words.linkRegistrationTermsOfUse);

        $(".languageNameRU").html(words.languageNameRU);

        $(".languageNameEN").html(words.languageNameEN);
    }
})(window);