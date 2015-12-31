
/**
 * Creates any message that should be displayed
 *
 * The problem with this is that it is all displayed in HTML. If that falls over the canvas
 * the keyboard and mouse listeners do not work anymore. Also it gives you the ability to select
 * the text. Better would be to create this hud in the Canvas with Three.
 */
function HUD(menu) {

	this.displayingRenderInfo = false;

	this.renderInfo = function() {
		var ri = menu.hud;
		this.displayingRenderInfo ? ri.hide() : ri.show();
		this.displayingRenderInfo = !this.displayingRenderInfo;

		console.log("display render info");
	}

	//TODO Adding HUD via Three
	//http://stackoverflow.com/questions/10703212/recommended-way-to-make-a-2d-hud-in-webgl
	//http://graphic-sim.com/21_HUD.php
	//
}
