function Entity() {

	//NEW DATA: That every entity should have.
	this.loc = [0,0,0];
	this.img = "";
	this.shapeType = ShapeType.RECTANGLE;
	this.radius = 0.2; //TODO remove here. Not true for all entities
	this.id = 0;
	this.health = 100;

	this.moving = function() {
		return false;
	}

	/* If true, needs re-rendering. */
	this.invalidated = false;
	
	/* If true, needs to be removed from rendering and game controller. */
	this.destroyMe = false;
	
	/* Request to be re-rendered. */
	this.invalidate = function() {
			this.invalidated = true;
		};
	
	/* Request to be removed entirely. */	
	this.destroy = function() {
			this.destroyMe = true;
		};
	
	/* Export all fields as key-value pairs for initialisation data. Might need to
	   be overwritten by some classes, e.g. when using fields containing other
	   objects. */
	this.getInitData = function() {
	    var result = {};
			for (var key in this) {
				if (!isFunction(this[key]))
					result[key] = this[key];
			}
			return result;
		};
	
	/**
	 * Abstract functions
	 */
	 
	/* Update object (e.g. update location based on object's velocity).
	   Gets elapsed time in milliseconds. */
	this.update = function(t_elapsed) { };
	
	/* Return synchronisation data-object, if any. Return null if no
	   synchronisation is required. */
	this.getSyncData = function() { return null; };
	
	/* Synchronise this object according to the data received. */
	this.integrate = function(data) { };
}

Entity.__include = function(obj) {
	obj.prototype = new Entity();
	return function (origConstructor) {
			return function () {
			  var args = Array.prototype.slice.call(arguments);
				var F = function () {};
				F.prototype = origConstructor.prototype;
				var inst = new F;
				inst.__args = args;
				inst.__func = origConstructor.name;
				var ret = origConstructor.apply(inst, args);
				return Object(ret) === ret ? ret : inst;
			}
	}(obj);
}
