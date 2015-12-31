/**
 * Renderer.
 */
function Renderer(menu) {
	
	// Create canvas.
	this.canvas = menu.canvas[0];
	logger.log("Renderer", "Creating renderer for canvas." );
	this.width = this.canvas.offsetWidth;
	this.height = this.canvas.offsetHeight;
	
	// Create renderer
	this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, antialias : true });
	this.renderer.setSize(this.width, this.height);
	
	// Set some camera attributes.
	this.view_angle = 45;
	this.aspect = this.width / this.height;
	this.near = 0.1;
	this.far = 1000;
	
	// Create camera.
	this.camera = new THREE.PerspectiveCamera(
			this.view_angle, this.aspect, this.near, this.far);
	
	// Retrieve camera position.
	this.getCameraPosition = function() {
			return [	this.camera.position.x,
							this.camera.position.y,
							this.camera.position.z ];
		};
	
	// Change camera position.
	this.setCameraPosition = function(x, y, z) {
			this.camera.position.x = x;
			this.camera.position.y = y;
			this.camera.position.z = z;
		};
      
	// Create scene.
	this.scene = new THREE.Scene();
	this.scene.add(this.camera);
	
	//this.container.append(this.renderer.domElement);
	
	// Associative array of game entities (scene nodes).
	this.entities = new Object();
	
	// Add a game entity.
	this.addEntity = function(ent, parent) {
			
			ent.shape.position.set(ent.loc[0], ent.loc[1], ent.loc[2]);
			ent.shape.rotation.set(ent.ori[0], ent.ori[1], ent.ori[2]);
			
			// Add entity to list.
			if(typeof parent != "undefined")
				this.entities[parent.__id].add(ent.shape);
			else
				this.scene.add(ent.shape);
			this.entities[ent.__id] = ent;
            this.updateNObjects();
		};

    this.updateNObjects = function() {
           menu.hud.nObjects[0].innerHTML = Object.keys(this.entities).length;
        };

	this.initEntity = function(ent,type) {
 		switch (type) {
   		case Player:
   			ent.shape = EntityFactory.square(0.64, ent.texture);
				/*
				var lbl = EntityFactory.textLabel(" " + ent.name + " ",
							{ fontsize: 28, backgroundColor: {r:255, g:100, b:100, a:0.6} });
				lbl.position.set(ent.loc[0]+1, ent.loc[1]+1, ent.loc[2] + 0.01);
				lbl.position.normalize();
				ent.shape.add( lbl );
				*/
				break;
   		case World:
				var size = 16;
   			ent.shape = EntityFactory.square(size, ent.texture, size / 4);
   			break;
     	 case Building:
			ent.shape = EntityFactory.square(ent.size, ent.texture, ent.size / 4);
			break;
		case Bullet:
			ent.shape = EntityFactory.square(0.2, ent.texture, 0.2 / 4);
			break;
		case Castle:
			ent.shape = EntityFactory.square(ent.size, ent.texture, ent.size / 4);
			break;
		case Cactus:
			ent.shape = EntityFactory.square(1, ent.texture, ent.size / 4);
			break;
   		default:
   			logger.error("Renderer.initEntity", "No known shape for entity type " + type);
   			break;
 		}
	}
	
	this.removeEntity = function (ent) {
      logger.log("Renderer.removeEntity", "Removing entity " + ent.__id);
			this.scene.remove(this.entities[ent.__id].shape);
			delete this.entities[ent.__id];
			this.updateNObjects();
		};
	
	// Update all entities.
	this.updateAllEntities = function() {
			for(var key in this.entities)
				this.updateEntity(key);
		};
	
	// Update the camera.
	this.updateCamera = function (player) {
			var camoldpos = this.getCameraPosition();
			if(player.loc[0] != camoldpos[0] || player.loc[1] != camoldpos[1]) {
				var camnewpos = [	camoldpos[0] + 0.05 * (player.loc[0] - camoldpos[0]),
										camoldpos[1] + 0.05 * (player.loc[1] - camoldpos[1]) ];
				this.setCameraPosition(camnewpos[0], camnewpos[1], camoldpos[2]);
				/*var camtar = [	camoldpos[0] + 0.3 * (player.loc[0] - camoldpos[0]),
									camoldpos[1] + 0.3 * (player.loc[1] - camoldpos[1]) ];
				this.camera.lookAt(new THREE.Vector3(camtar[0], camtar[1], 0));*/
			}
		};
	
	// Update this entity.
	this.updateEntity = function(key) {
			var ent = this.entities[key];
			if(ent.invalidated) {
				ent.shape.position.set(ent.loc[0], ent.loc[1], ent.loc[2]);
				ent.shape.rotation.set(ent.ori[0], ent.ori[1], ent.ori[2]);
				ent.invalidated = false;
			}
			if (ent.destroyMe) {
					this.removeEntity(ent);
			}
		};
	
	/**
	 * Draw method.
	 */
	this.draw = function() {
			this.renderer.render(this.scene, this.camera);
		};
}
