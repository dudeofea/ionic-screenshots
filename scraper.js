/* Actions to take */
var actions = [
	['go', '/'],
	['login', '']
];
var url_prefix = 'http://localhost:8888/#';

/* Screen Sizes to use */
var sizes = [
	{w: 640, h: 960,  name: "iPhone 3.5 inch"},
	{w: 640, h: 1136, name: "iPhone 4.0 inch"},
	{w: 750, h: 1334, name: "iPhone 4.7 inch"},
	{w:1242, h: 2208, name: "iPhone 5.5 inch"},
	{w:1536, h: 2048, name: "iPad"},
];

var page = require('webpage').create();
page.viewportSize = {width: sizes[0].w, height: sizes[0].h};
page.open(url_prefix + actions[0][1], function(status) {
	setTimeout(function(){
		page.render('out.png');
		phantom.exit();
	}, 100);
});
