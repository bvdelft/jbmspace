/**
 * Created by Kapitein on 6-8-2014.
 */
function BulletPlayerCollision(game, b, p) {
	if(b.ownerId != p.__id) {
		game.incScore(b.ownerId);
		b.destroy();
		p.loc = p.orgLoc.slice();
		logger.info("Player new loc:", p.loc);
		console.log(p.loc);
		p.invalidate();
	}
}