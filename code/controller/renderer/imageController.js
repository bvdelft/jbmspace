
function ImageController() {
	var self = this;

	this.addresses = {
		"crate" : "../assets/img/crate.jpg",
		"space" : "../assets/img/space.jpg",
		"grass" : "../assets/img/grass.jpg",
		"desert" : "../assets/img/desert.jpg",
		"cactus" : "../assets/img/cactus.png",
		"trooper_black" : "../assets/img/trooper/trooper_black.png",
		"trooper_blue" : "../assets/img/trooper/trooper_blue.png",
		"trooper_turqoise" : "../assets/img/trooper/trooper_turqoise.png",
		"trooper_dev" : "../assets/img/trooper/trooper_dev.png",
		"trooper_green" : "../assets/img/trooper/trooper_green.png",
		"trooper_pink" : "../assets/img/trooper/trooper_pink.png",
		"trooper_purple" : "../assets/img/trooper/trooper_purple.png",
		"trooper_red" : "../assets/img/trooper/trooper_red.png",
		"trooper_yellow" : "../assets/img/trooper/trooper_yellow.png",
		"trooper_white" : "../assets/img/trooper/trooper_white.png",
		"trooper_princess" : "../assets/img/trooper/trooper_princess.png",
		"castle_black" : "../assets/img/castles/castle_black.png",
		"castle_blue" : "../assets/img/castles/castle_blue.png",
		"castle_turqoise" : "../assets/img/castles/castle_turqoise.png",
		"castle_green" : "../assets/img/castles/castle_green.png",
		"castle_pink" : "../assets/img/castles/castle_pink.png",
		"castle_purple" : "../assets/img/castles/castle_purple.png",
		"castle_red" : "../assets/img/castles/castle_red.png",
		"castle_yellow" : "../assets/img/castles/castle_yellow.png",
		"castle_white" : "../assets/img/castles/castle_white.png",
		"castle_princess" : "../assets/img/castles/castle_princess.png",
        "building_inn" : "../assets/img/buildings/inn.png",
        "bullet" : "../assets/img/bullet.png",
		"bullet2" : "../assets/img/bullet2.png"
	};
	
	this.sprites = new Array();
	this.found = 0;
	this.loaded = 0;
	this.loading_initialized = false;
	
	this.load = function() {
		for(var name in this.addresses) {
			var address = this.addresses[name];
			this.found++;
			this.sprites[name] = THREE.ImageUtils.loadTexture(address, {}, 
				function() { 
					self.loaded++;
					// logger.log("ImageController.load", "Loaded " + self.loaded + " images.");
				});
		}
		this.loading_initialized = true;
	}
	
	this.get = function(name) {
		return this.sprites[name];
	}

	this.ready = function() {
		return this.loading_initialized && this.loaded === this.found;
	}
}
