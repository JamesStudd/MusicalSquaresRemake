let allNotes = [];
let playLine;
let scaleSelection = 0;
let gridSize = 16;
let noteSize = 40;
let noteDeselectedColor = [62, 141, 152];
let noteSelectedColor = [255, 255, 255];

const scales = [
	{
		name: "A Pentatonic",
		notes: ["A2", "B2", "C#3", "E3", "F#3"],
	},
	{
		name: "F Pentatonic",
		notes: ["F2", "G2", "A2", "C3", "D3"],
	},
	{
		name: "C Penatonic",
		notes: ["C3", "D3", "E3", "F3", "G3"],
	},
];

let activatingNotes = false;

let scaleDropdown;
let displayNotesCheckbox;

let oscillatorDropdown;

const rev = new Tone.Reverb({
	decay: 4,
}).toDestination();

const synth = new Tone.PolySynth({
	envelope: {
		attack: 0.05,
		decay: 0.1,
		sustain: 0.5,
		release: 0.2,
	},
})
	.connect(rev)
	.toDestination();

synth.set({
	oscillator: {
		type: "sine",
	},
});

console.log(synth);

function setup() {
	let cnv = createCanvas(noteSize * gridSize, noteSize * gridSize);
	cnv.parent("sketch-holder");

	Tone.Transport.start();

	playLine = new Line(3.5);

	setupGrid(true);

	scaleDropdown = createSelect();
	for (const scale of scales) {
		scaleDropdown.option(scale.name);
	}
	scaleDropdown.changed(newScaleSelected);
	scaleDropdown.parent("settings");

	displayNotesCheckbox = createCheckbox("Show Notes", true);
	displayNotesCheckbox.parent("settings");

	frameRate(60);

	textAlign(CENTER, CENTER);
}

function draw() {
	background(18, 41, 44);
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
			synth.triggerAttackRelease(note.note, "8n");
			note.canPlay = false;
		}
	});

	playLine.draw();
}

function newScaleSelected() {
	scaleDropdown.value();
	for (let i = 0; i < scales.length; i++) {
		if (scales[i].name === scaleDropdown.value()) {
			scaleSelection = i;
		}
	}

	setupGrid();
}

function setupGrid(initial = false) {
	let octaveIncrease = 0;

	for (let col = 0; col < gridSize; col++) {
		for (let row = 0; row < gridSize; row++) {
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
						4 + col * noteSize,
						4 + height - noteSize - row * noteSize,
						note
					)
				);
			} else {
				let n = allNotes[col * gridSize + row];
				n.note = note;
			}
		}
	}
}

function mousePressed() {
	if (mouseX === 0 && mouseY === 0) return;
	let note = getSingleNoteFromMousePos();
	if (note) {
		note.active = !note.active;
		activatingNotes = note.active;
	}
}

function mouseReleased() {
	activatingNotes = !activatingNotes;
}

function mouseDragged() {
	let note = getSingleNoteFromMousePos();
	if (note) {
		note.active = activatingNotes;
	}
}

function getSingleNoteFromMousePos() {
	for (let note of allNotes) {
		if (note.isPressed(mouseX, mouseY)) {
			return note;
		}
	}
	return undefined;
}

function keyPressed() {
	// Spacebar
	if (keyCode === 32) {
		allNotes.forEach((note) => {
			note.active = false;
		});
	}
}
