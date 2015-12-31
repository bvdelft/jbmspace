/**
 * Keyboard Listener: Use as follow: 
 *   Two Public methods: onKeyChange and onKeyPress
 * @class
 * @constructor 
 */
function KeyboardListener() {
	
	// The keycodes that will be mapped when a user presses a button.
	KEY_DOWN_CODES = {
		32: 'space',
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down',
		87: 'W', 
		65: 'A',
		68: 'D',
		83: 'S'
		
	}
	KEY_PRESS_CODES = {
		112: 'F1', 
		113: 'F2'
	}
	
	//PRIVATE
	this.onKeyChangeMap = {};
	this.onKeyPressMap = {};
	this.keysDown = new Array();//for keeping record of which keys are down
	
	/**
	 * Public: 
	 * onKeyChange(KEY, FUNC) with the KEY (String format, e.g. "F1") that should call FUNC when pressed and when released. 
	 *   Func will get 2 parameters: A boolean wether or not the key is down and he KEY (String format)
	 */
	this.onKeyChange = function(key, func) {
		if(key instanceof Array) {
			for(ky in key) {
				this.onKeyChangeMap[key[ky]] = func;
			}
		}
		else
			this.onKeyChangeMap[key] = func;
	}
	
	/**
	 * Public: 
	 * call onKeyChange(KEY, FUNC) with the KEY (String format) that should call FUNC when pushed, and only once. 
	 *  Func will get 2 parameters: A boolean wether or not the key is down and he KEY (String format)
	 */
	this.onKeyPress = function(key, func) {
		if(key instanceof Array) {
			for(ky in key) {
				this.onKeyPressMap[key[ky]] = func;
			}
		}
		else
			this.onKeyPressMap[key] = func;
	}
	
	//PRIVATE
	this.handleKeyChange = function(key, down) {
		var keyCode = (key.keyCode) ? key.keyCode : key.charCode;
		key.preventDefault();
		keyString = KEY_DOWN_CODES[keyCode];
		
		if(keyString != null && this.onKeyChangeMap[keyString] != null) {
			if(down && this.keysDown[keyString] !== true) {
				this.keysDown[keyString] = true;
				this.onKeyChangeMap[keyString](down, keyString); //fire the listener
			} else if (!down && this.keysDown[keyString] === true) {
				this.keysDown[keyString] = false;
				this.onKeyChangeMap[keyString](down, keyString);
			}
		}
	}
	
	//PRIVATE handle key PRESSES
	this.handleKeyPress = function(key, down) {
		var keyCode = (key.keyCode) ? key.keyCode : key.charCode;
		key.preventDefault();
		keyString = KEY_PRESS_CODES[keyCode];
		
		if(keyString != null && this.onKeyPressMap[keyString] != null) {
			if(down && this.keysDown[keyString] !== true) {
				this.keysDown[keyString] = true;
				this.onKeyPressMap[keyString](down, keyString); //fire the listener
			} else if (!down && this.keysDown[keyString] === true) {
				this.keysDown[keyString] = false;
			}
		}
	}
	
	//PRIVATE handle a single Key Event
	this.handleDocumentKeyEvent = function(key, down) {
		var keyCode = (key.keyCode) ? key.keyCode : key.charCode;  // Firefox and opera use charCode instead of keyCode to return which key was pressed.
		if(KEY_DOWN_CODES[keyCode])
			this.handleKeyChange(key, down);
		else if(KEY_PRESS_CODES[keyCode])
			this.handleKeyPress(key, down);
	}
	
	//Public Load
	this.load = function() {
		var self = this;
		
		document.onkeydown = function(key) {
			self.handleDocumentKeyEvent(key, true);
		}
		document.onkeyup = function(key) {
			self.handleDocumentKeyEvent(key, false);
		}
	}
}/*
k = new KeyboardListener();
k.load();
var keys = ["left", "right", "down", "up"];
k.onKeyChange(keys, function(key, down) {console.log(key + " " + down);});
k.onKeyPress(["F1", "F2"], function() {console.log("F1 press");});*/