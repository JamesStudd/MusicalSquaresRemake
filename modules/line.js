export default class Line {
	constructor(speed) {
		this.pos = createVector(0, 0);
		this.speed = speed;
		this.dir = createVector(0, 0);
	}

	update(dTime) {
		this.pos.add(
			createVector(this.dir.x, this.dir.y).mult(dTime / this.speed)
		);
	}

	draw() {
		fill(255);
		strokeWeight(4);
		stroke(0);
		if (this.dir.x !== 0) {
			line(this.pos.x, this.pos.y, this.pos.x, height);
		} else {
			line(this.pos.x, this.pos.y, width, this.pos.y);
		}
	}

	needsResetting() {
		if (this.dir.x !== 0) {
			return this.dir.x > 0 ? this.pos.x >= width : this.pos.x <= 0;
		} else {
			return this.dir.y > 0 ? this.pos.y >= height : this.pos.y <= 0;
		}
	}

	reset() {
		if (this.dir.x !== 0) {
			this.pos.x = this.dir.x > 0 ? 0 : width;
		} else {
			this.pos.y = this.dir.y > 0 ? 0 : height;
		}
	}

	setNewDir(x, y) {
		let lastDir = createVector(this.dir.x, this.dir.y);
		this.dir = createVector(x, y);

		let oldX = Math.abs(lastDir.x);
		let newX = Math.abs(x);

		let oldY = Math.abs(lastDir.y);
		let newY = Math.abs(y);

		let newPos = createVector(0, 0);

		if ((oldX > 0 && newX > 0) || (oldY === 1 && newY !== 1)) {
			newPos.x = this.pos.x;
		} else if ((oldY > 0 && newY > 0) || (oldX === 1 && newX !== 1)) {
			newPos.y = this.pos.y;
		}

		this.pos = newPos;
	}
}
