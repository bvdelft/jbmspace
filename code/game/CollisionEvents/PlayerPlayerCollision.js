/**
 * Created by Kapitein on 6-8-2014.
 */

function PlayerPlayerCollision(p1, p2) {
	p1.unUpdate();
	p1.invalidate();

	p2.unUpdate();
	p2.invalidate();
}