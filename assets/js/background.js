var apiOrigin = 'https://i.ame.im/',
    logPage = '',
    popup = '',
    login = '',
    key = '',

    id_guide = '',
    steps_url = [];

getBrowser().cookies.get({url:apiOrigin,name:"security_token_admin"}, function(cookies) {if(cookies!=null)getLogin(cookies.value)});

// Выполняется при изменении на любой странице
getBrowser().tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  
  if(id_guide != '' && tab.status =='complete' && changeInfo.status == "complete"){

    getBrowser().cookies.get({url:apiOrigin, name: "ame_step_extension"}, function(cookies) {

      if(cookies!=null) {

        ame_step = cookies.value;

        if(ame_step != '' && steps_url.length > ame_step) showTip(id_guide, tab.id, ame_step);

        else exitTip();
      }

      else exitTip();
    });
  }
});

getBrowserRuntime().onMessage.addListener(function(request, sender, sendResponse) {

  if(request.exist == true && request.end == true) {

    sendResponse({farewell: "00000000000"});
    guide = jQuery.parseJSON(request.data);

    if(guide.steps.length > 0) {

      getBrowser().tabs.query({ currentWindow: true, active: true }, function(tabArray) {

        var json = {};
        json.tip = request.data;
        json.url = tabArray[0].url;
        json.title = tabArray[0].title;
        json.key = key.substr(5);

        $.get(apiOrigin + "bot/addTip", json, function(data) { console.log(data); });
      });
    }
    
    else console.log("не отправлено");
  }

  if(request.exist == false && request.end == false) sendResponse({farewell: "2222222222"});

  if(request.cookie_ame != '') {

    console.log(steps_url.length, request.cookie_ame);

    if(typeof request.cookie_ame  === "undefined") request.cookie_ame = 0;
    if(steps_url.length >= request.cookie_ame && steps_url.length != 0) {
      getBrowser().cookies.set({
        url: apiOrigin ,
        name: "ame_step_extension",
        value: request.cookie_ame + '',
        domain: '.ame.im',
        path: '/',
        secure: true
      });
    }

    else exitTip();
  }

  if(request.background ==  true) {

    if(typeof request.id_guide  !== "undefined") id_guide = request.id_guide;
    if(typeof request.steps_url  !== "undefined") {

      getBrowser().cookies.set({
        url: apiOrigin ,
        name: "ame_step_extension",
        value: '0',
        domain: '.ame.im',
        path: '/',
        secure: true
      });

      steps_url.length = 0;
      steps_url = request.steps_url;
    }

    sendResponse({
      'login': login,
      'key' : key,
      'id_guide': id_guide ,
      'steps_url': steps_url
    });
  }
});

getBrowser().cookies.onChanged.addListener(function(info) {
  if(info.cookie.name == 'security_token_admin' && info.cookie.domain == ".ame.im" && info.removed == false) getLogin(info.cookie.value);
  if(info.cookie.name == 'security_token_admin' && info.cookie.domain == ".ame.im" && info.removed == true) {
    login = '';
    key = '';
  }
});

function exitTip() {
  console.log("Пытается удалить или завершить подсказку");
  getBrowser().cookies.remove({url:apiOrigin, name: "ame_step_extension"});
  id_guide = '';
  steps_url = [];
}

function getLogin(val) {

  $.ajax({
    url: apiOrigin + 'bot/login?callback=?',
    type: 'GET',
    dataType: 'jsonp',
    data: 'key='+ val,
    success: function(data) {

      if(data.user.id > 0) {

        login = data.user.email;
        key = '&key=' + val;

        popup = getBrowserExtension().getViews({type: "popup"});

        if(popup != '') {
          
          popup[0].ameChatSiteObject.templateMessage('Авторизация прошла успешно, ' + data.user.email , false);
          popup[0].$('.amechatsiteMsgs').animate({scrollTop: popup[0].$('.amechatsiteMsgs').prop("scrollHeight")}, 500);
        }
      }
      
      else {
        login = '';
        key = '';
      }
    },
    error: function(data) { console.error(data); }
  });
}

function showTip(id_guide, activeTabId, ame_step) {

  sendAjax('id=' + id_guide + key, apiOrigin + 'bot/getTip?callback=?', function(data) {

    console.log(id_guide);
    console.log(ame_step);
    console.log(data.guide.tip);

    if(data.user.id > 0 &&  data.guide.tip != null) {
      getBrowser().tabs.insertCSS(activeTabId,{file:"/assets/css/quicktip.css"});
      getBrowser().tabs.executeScript(activeTabId, {file: "/assets/js/jquery-3.4.1.min.js"}, function(){
        getBrowser().tabs.executeScript(activeTabId, {file: "/assets/js/quick_library/quick_library.js"}, function(){
          getBrowser().tabs.executeScript(activeTabId, {code:  'var array_enjoy = ' + htmlDecode(JSON.stringify(data.guide.tip)) + ';' }, function(){
            getBrowser().tabs.executeScript(activeTabId, {code:  'var step =  ' + ame_step + ';' }, function(){
              getBrowser().tabs.executeScript(activeTabId, {file: "/assets/js/hint.js"});
            });
          });
        });
      });
    } 
      
    else ameChatSiteObjectThis.templateMessage(data.msg, true);
  },
  function(data) { console.log('Error! showTip() function!'); });
}

function sendAjax(parametrs, host, functionSuccess, functionError) {
  $.ajax({
    url: host ,
    type: 'GET',
    dataType: 'jsonp',
    data: parametrs,
    success: function(data) { functionSuccess (data); },
    error: function(data) { functionError (data); }
  });
}

function htmlDecode(input) {
  var doc = new DOMParser().parseFromString(input.replace(/&quot;/g, '\\"'), "text/html");
  return doc.documentElement.textContent;
}

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