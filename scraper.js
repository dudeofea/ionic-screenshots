var fs = require('fs');

/* Actions to take */
var actions = [
	{ action:'login', url:'/app/login', email: 'souhail@digitalfractal.com', password: 'testtest'},
	{ action:'go', url:'/app/dashboard'},
	{ action:'go', url:'/app/profile'},
];
var url_prefix = 'http://localhost:8888/#';
var to_download = 0;
var downloaded = 0;

/* Screen Sizes to use */
var sizes = [
	{w: 640, h: 960,  name: "iPhone 3.5 inch", platform_class:'platform-ios platform-cordova platform-webview platform-ios9 platform-ios9_2', zoom: 2},
	{w: 640, h: 1136, name: "iPhone 4.0 inch", platform_class:'platform-ios platform-cordova platform-webview platform-ios9 platform-ios9_2', zoom: 2},
	{w: 750, h: 1334, name: "iPhone 4.7 inch", platform_class:'platform-ios platform-cordova platform-webview platform-ios9 platform-ios9_2', zoom: 2},
	{w:1242, h: 2208, name: "iPhone 5.5 inch", platform_class:'platform-ios platform-cordova platform-webview platform-ios9 platform-ios9_2', zoom: 3},
	{w:1536, h: 2048, name: "iPad", platform_class:'platform-ios platform-cordova platform-webview platform-ipad platform-ios9 platform-ios9_2', zoom: 2},
];

var openWhenReady = function(page, url, callback, clear){
	if(clear == null){ clear = false; }
	var myurl = url;
	var mycallback = callback;
	page.open(myurl, function(status) {
		if(status == "fail"){
			//try again in a second
			setTimeout(function(){
				openWhenReady(page, myurl, callback);
			}, 1000);
			//console.log("Couldn't get url:", myurl);
			return;
		}
		var checkStatus = function () {
            var readyState = page.evaluate(function(clear){
				if(clear){
					localStorage.clear();
				}
                return document.readyState;
            }, clear);
            if (readyState === "complete") {
                mycallback();
            } else {
				setTimeout(checkStatus);
            }
        };
		setTimeout(checkStatus);
	});
};

var getScreenshots = function(dev, actions, ind){
	if(ind == null){ ind = 0; }
	if(ind >= actions.length){ return; }
	var url_suffix = actions[ind].url;
	to_download++;
	var page = require('webpage').create();
	page.viewportSize = {width: dev.w, height: dev.h};
	page.zoomFactor = dev.zoom;
	//console
	page.onConsoleMessage = function(msg, lineNum, sourceId) {
		console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
	};
	//errors
	page.onError = function(msg, trace) {
		var msgStack = ['ERROR: ' + msg];
		if (trace && trace.length) {
			msgStack.push('TRACE:');
			trace.forEach(function(t) {
				msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
			});
		}
		console.error(msgStack.join('\n'));
	};
	//clear localStorage on login
	var clear = false;
	if(actions[ind].action == 'login'){
		clear = true;
	}
	openWhenReady(page, url_prefix + url_suffix, function(status) {
		setTimeout(function(){
			//add custom platform class to render properly
			var ret = page.evaluate(function (platform_string) {
				var body = document.getElementsByTagName("body")[0];
				var c = body.className;
				c = c.replace(new RegExp(' platform-[^ ]*', 'g'), '');		//remove previous platforms
				c += " " + platform_string;
				body.className = c;
				return c;
			}, dev.platform_class);
			setTimeout(function(){
				//render the page
				var filename = dev.name+'/'+url_suffix.replace('/', '%')+'.png';
				if(fs.exists(filename)){
					fs.remove(filename)
				}
				console.log('saving:', filename);
				page.render(filename);
				//do optional stuff
				if(actions[ind].action == 'login'){
					//Enter Credentials
					page.onCallback = function(data) {
						//console.log('CALLBACK: ' + JSON.stringify(data));
						//page.render('hey.png');
						downloaded++;
						//run the next action
						getScreenshots(dev, actions, ind+1);
					};
					//thanks to http://stackoverflow.com/a/23709904/182135
					var sendKeys = function(page, selector, keys){
						page.evaluate(function(selector){
							// focus on the text element before typing
							var element = document.querySelector(selector);
							element.click();
							element.focus();
						}, selector);
						page.sendEvent("keypress", keys);
					}
					//submit form inputs
					for (var key in actions[ind]) {
						if (actions[ind].hasOwnProperty(key) && key != 'url' && key != 'action'){
							sendKeys(page, "input[type="+key+"]", actions[ind][key]);
						}
					}
					//click a submit button if available
					page.evaluate(function(action) {
						var arr = document.getElementsByTagName("form")[0];
						var b = arr.querySelectorAll("button[type=submit]")[0];
						b.click();
						//wait for page load
						setTimeout(function(){
							callPhantom(window.location.href);
						}, 10000);
					}, actions[ind]);
				}else{
					downloaded++;
					//run the next action
					getScreenshots(dev, actions, ind+1);
				}
			}, 0);
		}, 0);
	}, clear);
}

//run in parallel for all sizes
for (var i = 0; i < sizes.length; i++) {
	getScreenshots(sizes[i], actions);
}

//dont exit until we're done
var waitForDownloads = function(){
	if(downloaded < to_download){
		setTimeout(waitForDownloads, 500);
	}else{
		phantom.exit();
	}
};
waitForDownloads();
