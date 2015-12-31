/**
 *
 * @param imgsrc Location as /assests/img/entities/buildings/[imgsrc].png
 * @constructor
 */
function Building(imgsrc, size, loc) {

    logger.info("Creating new building: " + imgsrc + "," + size);

    this.img = imgsrc;
    this.size = size;
    this.loc = loc;

    this.self = this;
    this.health = 10000;
    this.id = "Building_" + freshID();
    //this.type = ENTITY_TYPES.BUILDING;

    this.invalidated = false;
    this.outdated = false;
    this.ori = new Array(0, 0, 0);
    this.texture = "building_" + this.img;

    this.velocity = 0;
    this.strafe = 0;

    this.syncData = function() {
        return {
                loc : this.loc.slice(0),
                texture : this.texture
            };
    }

    this.sync = function(data) {
        this.loc = data.loc.slice(0);
        this.texture = data.texture;
        logger.log("Setting data: ");
        logger.log(data);
    }

    this.initData = function() {
        var res = this.syncData();
        res.img = this.img;
        res.size = this.size;
        res.loc = this.loc
        return res;
    }

    this.update = function(t_elapsed) {
        /*if(this.velocity != 0) {
         this.loc[1] += Math.cos(this.ori[2] - Math.PI * 0.5) * this.velocity * t_elapsed;
         this.loc[0] -= Math.sin(this.ori[2] - Math.PI * 0.5) * this.velocity * t_elapsed;

         }*/
    }

}

Building.prototype = new Entity();


