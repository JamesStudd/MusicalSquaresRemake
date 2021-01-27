class Note {
	constructor(x, y, note) {
		this.x = x;
		this.y = y;
		this.note = note;

		this.size = 32;
		this.active = false;
		this.canPlay = true;
	}

	draw() {
		textSize(12);

		let col = this.active ? noteSelectedColor : noteDeselectedColor;

		fill(col);
		square(this.x, this.y, this.size);

		if (displayNotesCheckbox.checked()) {
			col = [0, 0, 0];
			fill(col);
			text(this.note, this.x + this.size / 2, this.y + this.size / 2);
		}
	}

	activate() {
		this.active = !this.active;
	}

	isPressed(x, y) {
		return (
			x >= this.x &&
			x <= this.x + this.size &&
			y >= this.y &&
			y <= this.y + this.size
		);
	}

	isLineOver(x) {
		return x >= this.x && x <= this.x + this.size;
	}
}
