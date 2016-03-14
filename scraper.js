var fs = require('fs');

/* Actions to take */
var actions = [
	{ action:'go', url:'/'},
	{ action:'go', url:'/1'},
	{ action:'go', url:'/1b'},
	{ action:'go', url:'/18'},
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

var openWhenReady = function(page, url, callback){
	var myurl = url;
	var mycallback = callback;
	page.open(myurl, function(status) {
		if(status == "fail"){
			console.log("Couldn't get url:", myurl);
			phantom.exit();
		}
		var checkStatus = function () {
            var readyState = page.evaluate(function () {
                return document.readyState;
            });
            if (readyState === "complete") {
                mycallback();
            } else {
				setTimeout(checkStatus);
            }
        };
		setTimeout(checkStatus);
	});
};

var getScreenshot = function(dev, url){
	var url_suffix = url;
	var mydev = dev;
	to_download++;
	var page = require('webpage').create();
	page.viewportSize = {width: mydev.w, height: mydev.h};
	page.zoomFactor = mydev.zoom;
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
			}, mydev.platform_class);
			console.log('ret:', ret);
			setTimeout(function(){
				//render the page
				var filename = dev.name+'/'+url_suffix.replace('/', '-')+'.png';
				if(fs.exists(filename)){
					fs.remove(filename)
				}
				page.render(filename);
				downloaded++;
			}, 1000);
		}, 1000);
	});
}

var getDeviceScreenshots = function(dev){
	var mydev = dev;
	for (var i = 0; i < actions.length; i++) {
		getScreenshot(mydev, actions[i].url);
	}
}

for (var i = 0; i < sizes.length; i++) {
	getDeviceScreenshots(sizes[i]);
}

var waitForDownloads = function(){
	if(downloaded < to_download){
		setTimeout(waitForDownloads);
	}else{
		phantom.exit();
	}
};
waitForDownloads();
