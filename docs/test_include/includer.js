/**
 * List of modules that should be
 * loaded and initialized by default.
 **/
var tb_std_modules =
	[ "test01", "test02", "test03" ];

/**
 * Prepares ToolboxJS by preparing a loading
 * and initializing structure for files and
 * (standard) modules.
 **/
function tbInitialize() {
	// Define lists and counters of modules and files.
	if(typeof tb_init_count == "undefined")
		tb_init_count = 0;
	if(typeof tb_init_url == "undefined")
		tb_init_url = new Array();
	if(typeof tb_init_path == "undefined")
		tb_init_path = "";
	// Include the standard modules.
	for(var i = 0; i < tb_std_modules.length; i++)
		require(tb_std_modules[i]);
	// Start loading scripts.
	tbLoadScripts();
}
// Automatically initialize ToolboxJS.
tbInitialize();

/**
 * Add a module's include script to
 * the ToolboxJS loading list.
 **/
function tbRequireModule(name) {
	// Change include path.
	var tmp = tb_init_path;
	tb_init_path += name + "/";
	// Push the url to the include list once.
	var url = tb_init_path + "include.js";
	if(tb_init_url.indexOf(url) == -1)
		tb_init_url.push(url);
	tbLoadScripts();
	tb_init_path = tmp;
}
function require(name) {
	tbRequireModule(name);
}

/**
 * Add a script to the ToolboxJS loading list.
 **/
function tbIncludeScript(url) {
	url = tb_init_path + url;
	// Insert the url to the include list once.
	if(tb_init_url.indexOf(url) == -1)
		tb_init_url.splice(tb_init_count, 0, url);
}
function include(url) {
	tbIncludeScript(url);
}

/**
 * Add a url to the ToolboxJS
 * loading list.
 **/
function tbLoadScripts() {
	while(tb_init_count < tb_init_url.length) {
		// Load a script and add it to the document.
		var url = tb_init_url[tb_init_count++];
		var head = document.getElementsByTagName("head")[0];
		var script = document.createElement("script");
		script.setAttribute("type", "text/javascript");
		GET(url, "", function(src) {
				script.innerHTML += src;
			}, true);
		head.appendChild(script);
	}
}

/**
 * Quickly perform a custom AJAX request and pass
 * the response to a callback function.
 **/
function AJAX(post, url, params, callback, async, xml) {
	var xmlhttp;
	// Code for IE7+, Firefox, Chrome, Opera, Safari.
	if(window.XMLHttpRequest)
		xmlhttp = new XMLHttpRequest();
	// Code for IE6, IE5.
	else
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	// Handle response.
	xmlhttp.onreadystatechange = function() {
			if(xmlhttp.readyState == 4 && xmlhttp.status == 200 && callback)
				callback(xml ? xmlhttp.responseXML : xmlhttp.responseText);
		};
	// Randomize request to avoid caches.
	var r = new Date().getTime();
	// Start request.
	if(post === true) {
		// Handle POST request.
		xmlhttp.open("POST", url, async === false);
		xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlhttp.setRequestHeader("Content-length", params.length);
		xmlhttp.setRequestHeader("Connection", "close");
		xmlhttp.send("rndvar=" + r + "&" + params);
	} else {
		// handle GET request.
		xmlhttp.open("GET", url + "?rndvar=" + r + "&" + params, async === false);
		xmlhttp.send(null);
	}
}

/**
 * POST an AJAX request.
 **/
function POST(url, params, callback, async, xml) {
	AJAX(true, url, params, callback, async, xml);
}

/**
 * GET an AJAX request.
 **/
function GET(url, params, callback, async, xml) {
	AJAX(false, url, params, callback, async, xml);
}