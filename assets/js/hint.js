array_enjoy = funParse(array_enjoy.steps);
ame_timer_counter = 0;

var preloader = `
    <div class="quick-preloader">
        <div class="quick-preloader-container">
        <div class="quick-preloader-box1"></div>
        <div class="quick-preloader-box2"></div>
        <div class="quick-preloader-box3"></div>
        </div>
    </div> 
`;

var template = `
    <div class="quick_tip_block">

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

quickTip = new QuickTip(template, {
    "errorTimeout": 6,
    onEnd: function(){ getBrowserRuntime().sendMessage({cookie_ame: array_enjoy.length}); },
    onSkip: function(){ getBrowserRuntime().sendMessage({cookie_ame: array_enjoy.length}); },
    onStart: function() { 

        if(isUrl(array_enjoy[quickTip.getStep()]['url'])) AddCookie(quickTip.getStep());
        else quickTip.stop();
    },
    onStep: function (){

        if(isUrl(array_enjoy[quickTip.getStep()]['url'])) AddCookie(quickTip.getStep()); 
        else quickTip.stop();
    },
    onStepError: function() {

        console.log("Шаг не найден, программа завершается");
        quickTip.stop();
        getBrowserRuntime().sendMessage({cookie_ame: array_enjoy.length});
    }
});

// Подключаем прелоадер
quickTip.setPreloader(preloader);

// Подключаем сценарий
quickTip.set(array_enjoy);

// Запускаем сценарий
quickTip.run((typeof(step) == 'undefined' || step === null) ? 0 : step);

// Проверяет на какой странице открыт сценарий
function isUrl(url_guide, flag = 1){
    
    console.group("Hint.js -> isUrl()");
        console.log(location.href);
        console.log(url_guide);
        console.log(flag);
    console.groupEnd("Hint.js -> isUrl()");

    // только по домену
    if(flag == 1) {

        var url = new URL(location.href);
        var url_guide = new URL(url_guide);

        console.group("Hint.js -> isUrl() -> if(flag == 1)");
            console.log("location.href", location.href);
            console.log("url_guide", url_guide);
            console.log("flag", flag);
            console.log("new URL(location.href)", url);
            console.log("new URL(url_guide)", url_guide);
            console.log("if(url.host == url_guide.host)", url.host == url_guide.host);
            console.log("if(url.host === url_guide.host)", url.host === url_guide.host);
        console.groupEnd("Hint.js -> isUrl() -> if(flag == 1)");

        if(url.host == url_guide.host) return true;

        else return false;
    }

    // по домену и любому доп. url к нему без гет переменных
    if (flag == 2) {
        
        var url = new URL(location.href);
        var url_guide = new URL(url_guide);
        
        if(url_guide.host == url.host && url_guide.pathname == url.pathname) return true;
            
        else return false;
    }
}

// Просто парсит строку в js
function funParse(arr) {
	$.each(arr, function(k, v){
		if( arr[k]['triggerActive'] === false){
		  arr[k]['onClick'] = function () { quickTip.nextStep() };
		} else {
            delete arr[k]['onClick'];
        }
	});
	return arr;
}

function AddCookie(step) {
	getBrowserRuntime().sendMessage({cookie_ame: step});
}

function getBrowserRuntime() {
    if(typeof browser === "undefined") {
        return chrome.extension;
    } else {
        return browser.runtime;
    }   
}


