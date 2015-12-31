
function AudioController() {

	var laserAdress = "../assets/audio/laser.wav";
	var explosionAdress = "../assets/audio/explosion.wav";
	var walkingAdress = "../assets/audio/walking.wav";
	
	//Songs:
	var backgroundAdress = "../assets/audio/Xenogears.mp3";
	var menuAdress = "../assets/audio/Ducktales.mp3";
	
	this.load = function() {
		
		/////// Initialize ////////
		this.laser = new SoundPool(15, laserAdress, 0.8);
		this.laser.init();
		this.explosion = new SoundPool(5, explosionAdress, 0.65);
		this.explosion.init();
		
		this.walking = this.createSingleSound(walkingAdress, 0.7);
		this.hud = this.createSingleSound(menuAdress, 0.25);
		this.background = this.createSingleSound(backgroundAdress, 0.5);
	}
	
	//PRIVATE: Create a sound that loops. Start and stop with play() and pause()
	this.createSingleSound = function(address, volume) {
		obj = new Audio(address);
		obj.loop = true;
		obj.volume = volume;
		obj.load();
		return obj;
	}
	  
	this.ready = function() {
		return this.laser.isReady() && this.explosion.isReady() && this.background.readyState === 4 && this.hud.readyState === 4 && this.walking.readyState === 4;
	}
}