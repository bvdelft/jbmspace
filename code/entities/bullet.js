function Bullet(loc, ori, speed, ownerId) {

    logger.info("Bullet", "Creating new bullet: " + loc + "," + ori);

    this.size = 1;
    this.loc = loc;
    this.ori = ori;
    this.speed = speed;
	this.ownerId = ownerId;
	this.radius = 0.1;

    this.health = 10000;

    this.texture = "bullet2";

    var theta = ori[2] - Math.PI * 0.5;
    var dy = Math.cos(theta)
    var dx = -1 * Math.sin(theta)
    logger.log("Bullet", "Speed: " + speed);
    this.strafe = dx * speed;
    this.velocity = dy * speed;

    this.getSyncData = function() {
        return null;
    }

	this.moving = function() {
		return true; //if existend, always moving
	}

    this.integrate = function(data) {
    }

    this.lifeSpan = 5000;

    this.update = function(t_elapsed) {
        if (this.velocity != 0) this.loc[1] += this.velocity * t_elapsed;
        if (this.strafe != 0) this.loc[0] += this.strafe * t_elapsed;
        this.lifeSpan -= t_elapsed;
        this.invalidate();
        if (this.lifeSpan <= 0) this.destroy();
    }

}

Bullet = Entity.__include(Bullet);