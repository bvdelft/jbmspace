var userSettings = (function() {

	this.getCookie = function(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for(var i=0; i<ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1);
			if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
		}
		return "";
	}

	this.name = this.getCookie("name");
	this.pwd = this.getCookie("pwd");
	this.server = this.getCookie("server");
	if(!this.server)
		this.server = "http://jbmspace.nowplea.se:5050/";
	this.character = this.getCookie("character");


	this.setCookie = function(name, pwd, server, character) {
		var d = new Date();
		d.setTime(d.getTime() + (365*10*24*60*60*1000)); //10 years
		var expires = "expires="+d.toGMTString();

		logger.log("userSettings.setCookie", "Save name: " + name);
		logger.log("userSettings.setCookie", "Save pwd: " + pwd);
		logger.log("userSettings.setCookie", "Save server: " + server);
		logger.log("userSettings.setCookie", "Save character: " + character);

		document.cookie = "name="+name + "; " + expires;
		document.cookie = "character="+character + "; " + expires;
		document.cookie = "pwd="+pwd + "; " + expires;
		document.cookie = "server="+server + "; " + expires;
	}
	return this;
})();