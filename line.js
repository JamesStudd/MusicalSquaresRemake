class Line {
	constructor(speed) {
		this.x = 0;
		this.speed = speed;
	}

	update(dTime) {
		this.x += 1 * (dTime / this.speed);
	}

	draw() {
		fill(255);
		strokeWeight(2);
		line(this.x, 0, this.x, height);
	}
}
