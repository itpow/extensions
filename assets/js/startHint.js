var array_enjoy = [],
	countStep = 0,
	selStep = '',
	arrErr = [],
	enjoyhint = '',
	lastClick = '',
	guide = {
		version: 1,
		url: location.href
	};

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
            <div id="quickTip_text" class="quick_tip_text">Кнопка входа, нужна для того чтобы войти</div>
            <div class="quick_tip_footer">
                <a href="#" id="quickTip_stop">Пропустить</a>
                <button id="quickTip_next">Далее</button>
            </div>
        </div>`;

	var quickTip = new QuickTip(template, {

		onSkip: function() { 
			step = {};
			step.object = selStep;
			step.url = location.href;
			array_enjoy[countStep] = step;
			countStep += 1;
			arrErr = []; 
			console.log(array_enjoy);
		},
		onEnd: function () {
			console.log('end');
			lastClick = ''; 
		}
	});

alert('1.Для создания шага в сценарии, кликните по элементу, который хотите выделить.\n2.Если вам не нравится, как элемент выделен, нажмите "Нет".Шаг не будет сохранен.\n3.Если выделенная область вас устраивает, нажмите "Да". Шаг сохранится до перезагрузки страницы.\n4.Для отмены составления сценария, нажмите на "Отмена" в диалоге с Ame.\n5.Для сохранения сценария перезагрузите страницу. Сценарий будет сохранен в вашем личном кабинете');
document.addEventListener('click', handler, true);

function handler(e) {

	if($(e.target).parent('.quick_tip_block').length == 0 && $('.quick_tip_block').length == 0){

		console.log('Запускаю сценарий');

	    e.stopPropagation();
	    e.preventDefault();

		selStep = strSelector(e.target);

		quickTip.run();
		quickTip.set([
		 	{
				"object": selStep,
				"title": 'Выбор элемента',
	            "text": 'Этот элемент? [Для завершениия обновите страницу]',
	        	"triggerActive": false,
	        	MARGIN_OBJECT: 8,
	        	onClick: function() { quickTip.stop(); },
	        	"button_next": "Нет",
     			"button_stop": "Да",
	        }
		]);


	}

}

window.onbeforeunload = function() {
	guide.steps = array_enjoy;
	getBrowserRuntime().sendMessage({exist: true, data: JSON.stringify(guide), end: true}, function(response) {
	  console.log(response.farewell);
	});
};


function strSelector(target) {
	str = '';

	id = target.id;
	arr = target.classList;
	tag = target.tagName;

	if(id != '' && id != null){
		str = ' #'+ id ;
	}else{
		$.each(arr, function(k, v){
			str += '.'+ v ;
		});
	}
	if(str == ""){
		str = tag;
	}
	if($(str).length > 1 ){
		$.each($(str), function(k, v){
			if($(target)[0] == v) return str+=':eq('+k+')'
		});
	}
	return str;
}

getBrowserRuntime().sendMessage({exist: true, end: false}, function(response) {
	console.log(response);
});

function getBrowserRuntime() {
    if(typeof browser === "undefined") {
        return chrome.extension;
    } else {
        return browser.runtime;
    }   
}
