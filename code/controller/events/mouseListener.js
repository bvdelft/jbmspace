function MouseListener(canvas) {

	var self = this;
	
	this.canvas = canvas;
	this.mouseActionMap = false;
	
	this.mouseClickActionMap = new Array();
	
	//Public: Add here the action you want to perform on mouseMovement
	this.onMouseMove = function(func) {
		this.mouseActionMap = func;
	}
	
	this.addMouseClick = function(func) {
		this.mouseClickActionMap.push(func);
	}

	//Public
	this.load = function() {
		this.canvas.addEventListener("mousemove", this.handleMouseMovement);
		this.canvas.addEventListener('mousedown', this.handleClick, false); //Doesn't capture all events???
	}
	
	//Private: Let the single listener know what to do
	this.handleMouseMovement = function(event) {
		if(self.mouseActionMap !== false) {
			var rect = self.canvas.getBoundingClientRect();
			var x = event.clientX - rect.left;
			var y = event.clientY - rect.top;
			self.mouseActionMap(x, y);
		}
	}
	
	//Private: Let the click listeners know what to do
	this.handleClick = function(event) {
		if(event.button === 0) //only left MB
			for(var i = 0; i < self.mouseClickActionMap.length; i++) {
				var rect = self.canvas.getBoundingClientRect();
				var x = event.clientX - rect.left;
				var y = event.clientY - rect.top;
				self.mouseClickActionMap[i](x, y);
			}
	}
}
/*
function start() {
	m = new MouseListener(document.getElementById("cnvs"));
	m.load();
	m.addMouseClick(function(a, b){console.log("1: " + a + ":" + b)});
	m.addMouseClick(function(a, b){console.log("2: " + a + ":" + b)});
}*/