/**
 * Created by Kapitein on 6-8-2014.
 */
function CastlePlayerCollision(c, p) {
	if(c.ownerId != p.__id) {
		p.unUpdate();
		p.invalidate();
	}
}