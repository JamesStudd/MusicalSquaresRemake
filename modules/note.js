import { noteSelectedColor, noteDeselectedColor } from "./../setup/colors.js";

export default class Note {
	constructor(x, y, note) {
		this.x = x;
		this.y = y;
		this.note = note;

		this.size = 32;
		this.active = false;
		this.canPlay = true;
		this.displayNotes = false;
	}

	draw() {
		textSize(12);

		let col = this.active ? noteSelectedColor : noteDeselectedColor;

		fill(col);
		square(this.x, this.y, this.size);

		if (this.displayNotes) {
			col = [0, 0, 0];
			fill(col);
			text(this.note, this.x + this.size / 2, this.y + this.size / 2);
		}
	}

	toggleDisplayNotes() {
		this.displayNotes = !this.displayNotes;
	}

	activate() {
		this.active = !this.active;
	}

	getDistance(x, y) {
		var dx = Math.max(this.x - x, 0, x - (this.x + this.size));
		var dy = Math.max(this.y - y, 0, y - (this.y + this.size));
		return dx * dx + dy * dy;
	}

	isLineOver(x) {
		return x >= this.x && x <= this.x + this.size;
	}
}