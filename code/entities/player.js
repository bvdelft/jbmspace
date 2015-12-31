/**
 * Player.js
 */
function Player(name, type, loc) {

	this.name = name;
	this.health = 100;
	this.score = 0;
	this.loc = loc.slice();
	this.orgLoc = loc.slice();

	this.ori = [0, 0, 0];
	this.texture = "trooper_" + type;
	this.velocity = 0;
	this.strafe = 0;

	this.moving = function(){
		return this.velocity != 0 || this.strafe != 0;
	}

	this.previousTimeLapsed = 0;
	//@override
	this.update = function (t_elapsed) {
		this.previousTimeLapsed = t_elapsed;
		if (this.velocity != 0) this.loc[1] += this.velocity * t_elapsed;
		if (this.strafe != 0) this.loc[0] += this.strafe * t_elapsed;	
		if (typeof this.targetLoc != "undefined") {  // Smooth to target location.
			this.targetLoc[1] += this.velocity * t_elapsed;
			this.targetLoc[0] += this.strafe * t_elapsed;
			for (var i in [0,1]) {
				this.loc[i] += (this.targetLoc[i] - this.loc[i]) / 10;
				if (Math.abs(this.targetLoc[i] - this.loc[i]) <= 0.01)
					this.loc[i] = this.targetLoc[i];
			}
			if (this.targetLoc[0] == this.loc[0] &&
					this.targetLoc[1] == this.loc[1])
				delete this.targetLoc;
		}
		if (this.velocity != 0 || this.strafe != 0) this.invalidate();
	};

	this.unUpdate = function () {
		//this.loc = this.previousLoc;
		this.loc[1] -= this.velocity * this.previousTimeLapsed;
		this.loc[0] -= this.strafe * this.previousTimeLapsed;
		this.invalidate();
	}

	this.needsSyncing = false;
	this.prevState =
	{ ori: 0, velocity: 0, strafe: 0
	};
	//@override
	this.getSyncData = function () {
		if (!this.needsSyncing) return null;
		var d_turned = Math.abs(this.prevState.ori - this.ori[2]);
		if ( d_turned > (Math.PI / 20)  ||
			this.prevState.velocity != this.velocity
			|| this.prevState.strafe != this.strafe) {
			if (d_turned > (Math.PI / 20))
				this.prevState.ori = this.ori[2];
			this.prevState.velocity = this.velocity;
			this.prevState.strafe = this.strafe;
			return {
				loc: this.loc.slice(0), ori: this.ori.slice(0), velocity: this.velocity, strafe: this.strafe
			};
		} else {
			return null;
		}
	};

	//@override
	this.integrate = function (data) {
		this.targetLoc = data.loc.slice();
		this.ori = data.ori.slice();
		this.velocity = data.velocity;
		this.strafe = data.strafe;
		this.invalidate();
	};

	/* Own functions */

	this.up = function (moving, walkingSound) {
		logger.log("Player.up", "Player " + this.name + " is " + (moving ? "" : "not ") + "moving up");
		this.moved = true;
		this.velocity = moving ? 0.002 : 0;
		moving ? walkingSound.play() : walkingSound.pause();
	}

	this.down = function (moving, walkingSound) {
		this.velocity = moving ? -0.002 : 0;
		this.moved = true;
		moving ? walkingSound.play() : walkingSound.pause();
	}

	this.left = function (moving) {
		this.strafe = moving ? -0.002 : 0;
		this.moved = true;
	}

	this.right = function (moving) {
		this.strafe = moving ? 0.002 : 0;
		this.moved = true;
	}

	this.mouseMovementListener = function (game, x, y) {
		var pos = [ x, y ];
		var dim = [ game.renderer.canvas.offsetWidth, game.renderer.canvas.offsetHeight ];
		pos[0] -= dim[0] * 0.5;
		pos[1] -= dim[1] * 0.5;
		this.ori[2] = -Math.PI * 0.5 + Math.atan2(pos[0], pos[1]);
		var d_turned = Math.abs(this.prevState.ori - this.ori[2]);
		if (d_turned > (Math.PI / 180))
			this.invalidate();
	};

}

Player = Entity.__include(Player);