import Line from "./modules/line.js";
import Note from "./modules/note.js";
import Synth from "./modules/synth.js";
import { scales } from "./setup/scales.js";
import { backgroundColor } from "./setup/colors.js";

const GRID_SIZE = 16;
const NOTE_SIZE = 40;
const OFFSET = 4;

let allNotes = [];
let playLine;
let scaleSelection = 0;

let activatingNotes = false;

const synth = new Synth(0.05, 0.1, 0.5, 0.2, 4);

window.setup = function () {
	let cnv = createCanvas(NOTE_SIZE * GRID_SIZE, NOTE_SIZE * GRID_SIZE);
	cnv.parent("sketch-holder");

	frameRate(60);
	textAlign(CENTER, CENTER);

	// Sound setup
	Tone.Transport.start();

	// Grid setup
	setupGrid(true);
	playLine = new Line(3.5);

	// UI elements
	let scaleDropdown = createSelect();
	for (const scale of scales) {
		scaleDropdown.option(scale.name);
	}
	scaleDropdown.changed(() => newScaleSelected(scaleDropdown.value()));
	scaleDropdown.parent("settings");

	let displayNotesCheckbox = createCheckbox("Show Notes", false);
	displayNotesCheckbox.parent("settings");
	displayNotesCheckbox.changed(() =>
		allNotes.forEach((note) => note.toggleDisplayNotes())
	);
};

window.draw = function () {
	background(backgroundColor);
	playLine.update(deltaTime);

	if (playLine.x > width) {
		playLine.x = 0;
		allNotes.forEach((note) => {
			note.canPlay = true;
		});
	}

	allNotes.forEach((note) => {
		note.draw();
		if (note.active && note.canPlay && note.isLineOver(playLine.x)) {
			synth.play(note);
			note.canPlay = false;
		}
	});

	playLine.draw();
};

window.mousePressed = function () {
	if (mouseX === 0 && mouseY === 0) return;
	let note = getSingleNoteFromMousePos();
	if (note) {
		note.active = !note.active;
		activatingNotes = note.active;
	}
};

window.mouseReleased = function () {
	activatingNotes = !activatingNotes;
};

window.mouseDragged = function () {
	let note = getSingleNoteFromMousePos();
	if (note) {
		note.active = activatingNotes;
	}
};

window.keyPressed = function () {
	// Spacebar
	if (keyCode === 32) {
		allNotes.forEach((note) => {
			note.active = false;
		});
	}
};

function newScaleSelected(value) {
	for (let i = 0; i < scales.length; i++) {
		if (scales[i].name === value) {
			scaleSelection = i;
		}
	}
	setupGrid();
}

function getSingleNoteFromMousePos() {
	let lowestDist = 999;
	let closestNote = undefined;

	for (let note of allNotes) {
		let dist = note.getDistance(mouseX, mouseY);
		if (dist < lowestDist) {
			lowestDist = dist;
			closestNote = note;
		}
	}
	return closestNote;
}

function setupGrid(initial = false) {
	let octaveIncrease = 0;

	for (let col = 0; col < GRID_SIZE; col++) {
		for (let row = 0; row < GRID_SIZE; row++) {
			let note = scales[scaleSelection].notes[row % 5];
			if (row % 5 == 0) {
				octaveIncrease = row / 5;
			}
			let currentOctave = parseInt(note.slice(note.length - 1));
			note = `${note.slice(0, note.length - 1)}${
				currentOctave + octaveIncrease
			}`;

			if (initial) {
				allNotes.push(
					new Note(
						OFFSET + col * NOTE_SIZE,
						OFFSET + height - NOTE_SIZE - row * NOTE_SIZE,
						note
					)
				);
			} else {
				let n = allNotes[col * GRID_SIZE + row];
				n.note = note;
			}
		}
	}
}
