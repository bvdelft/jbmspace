/**
 * A sound pool to use for the sound effects
 */
function SoundPool(size, adress, volume) {
	
	this.size = size; // Size of the pool
	this.adress = adress;
	this.volume = volume;
	
	this.pool = [];
	this.currSound = 0;
 
  /*
   * Populates the pool array with the given sound
   */
	this.init = function() {
		for (var i = 0; i < this.size; i++) {
			// Initialize the sound
			var sound = new Audio(adress);
			sound.volume = volume;
			sound.load();
			this.pool[i] = sound;
		}
	};
	
	this.isReady = function() {
	
		if (this.size != this.pool.length) {
			return false;
			}
		
		for(var i = 0; i < this.pool.length; i++) {
			if(this.pool[i].readyState !== 4) {
				return false;
				}
		}
		return true;
	}
 
  /*
   * Plays a sound
   */
	this.get = function() {
		if(this.pool[this.currSound].currentTime == 0 || this.pool[this.currSound].ended) {
			this.pool[this.currSound].play();
		}
		this.currSound = (this.currSound + 1) % this.size;
	};
}