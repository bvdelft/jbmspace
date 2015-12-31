var EntityFactory = (function () {

	this.setImageController = function (ic) {
		logger.log("EntityFactory.setImageController", JSON.stringify(ic));
		this.imageController = ic;
	}
	
	this.square = function(size, _texture, repeat) {
		// Quad properties.
		var texture = this.imageController.get(_texture);
		if(typeof repeat != "undefined" && repeat > 1) {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set(repeat, repeat);
		}
		var material = new THREE.MeshBasicMaterial({
				side: THREE.DoubleSide,
				transparent: true,
				opacity: 1.0,
				map: texture
			});
		var geometry = new THREE.PlaneGeometry(size, size);
		// Create mesh.
		var mesh = new THREE.Mesh(geometry, material);
		mesh.overdraw = true;
		// Create quad.
		var quad = new THREE.Object3D();
		quad.add(mesh);
		return quad;
	}
	
	this.textLabel = function ( message, parameters )
	{
		if ( parameters === undefined ) parameters = {};
	
		var fontface = parameters.hasOwnProperty("fontface") ? 
			parameters["fontface"] : "Arial";
	
		var fontsize = parameters.hasOwnProperty("fontsize") ? 
			parameters["fontsize"] : 18;
	
		var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
			parameters["borderThickness"] : 4;
	
		var borderColor = parameters.hasOwnProperty("borderColor") ?
			parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
	
		var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
			parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

		//var spriteAlignment = parameters.hasOwnProperty("alignment") ?
		//	parameters["alignment"] : THREE.SpriteAlignment.topLeft;

		var spriteAlignment = THREE.SpriteAlignment.topLeft;
		

		var canvas = document.createElement('canvas');
		var context = canvas.getContext('2d');
		context.font = "Bold " + fontsize + "px " + fontface;
		
		// get size data (height depends only on font size)
		var metrics = context.measureText( message );
		var textWidth = metrics.width;
	
		// background color
		context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
									  + backgroundColor.b + "," + backgroundColor.a + ")";
		// border color
		context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
									  + borderColor.b + "," + borderColor.a + ")";

		context.lineWidth = borderThickness;
		// function for drawing rounded rectangles
		function roundRect(ctx, x, y, w, h, r) 
		{
			ctx.beginPath();
			ctx.moveTo(x+r, y);
			ctx.lineTo(x+w-r, y);
			ctx.quadraticCurveTo(x+w, y, x+w, y+r);
			ctx.lineTo(x+w, y+h-r);
			ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
			ctx.lineTo(x+r, y+h);
			ctx.quadraticCurveTo(x, y+h, x, y+h-r);
			ctx.lineTo(x, y+r);
			ctx.quadraticCurveTo(x, y, x+r, y);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();   
		}
		roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
		// 1.4 is extra height factor for text below baseline: g,j,p,q.
	
		// text color
		context.fillStyle = "rgba(0, 0, 0, 1.0)";

		context.fillText( message, borderThickness, fontsize + borderThickness);
	
		// canvas contents will be used for a texture
		var texture = new THREE.Texture(canvas) 
		texture.needsUpdate = true;

		var spriteMaterial = new THREE.SpriteMaterial( 
			{ map: texture, useScreenCoordinates: false, alignment: spriteAlignment } );
		var sprite = new THREE.Sprite( spriteMaterial );
		sprite.scale.set(2,1,1.0);
		return sprite;	
	}
	return this;
})();
