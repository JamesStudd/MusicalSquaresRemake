let polySynth;
let allNotes = [];
let playLine;
let scaleSelection = 0;
let gridSize = 16;

const scales = [
	{
		name: "A Pentatonic",
		notes: ["A2", "B2", "C#3", "E3", "F#3"],
	},
	{
		name: "F Pentatonic",
		notes: ["F2", "G2", "A2", "C3", "D3"],
	},
];

let activatingNotes = false;

let durationSlider, delaySlider, velocitySlider, speedSlider;
let durationDiv, delayDiv, velocityDiv, speedDiv;
let scaleDropdown;
let displayNotesCheckbox;

let adsrSettings;

const tSynth = new Tone.PolySynth({
	// "volume": -10,
	envelope: {
		attack: 0.5,
		decay: 0,
		sustain: 0.3,
		release: 0,
	},
}).toMaster();

tSynth.set({
	oscillator: {
		type: "sine",
	},
});

function setup() {
	Tone.Transport.start();
	createCanvas(32 * gridSize, 32 * gridSize);
	polySynth = new p5.PolySynth();
	adsrSettings = new ADSRSettings([0.05, 0.3, 0.8, 0.4]);

	playLine = new Line(4);

	setupGrid(true);

	durationSlider = new CustomSlider(10, 100, 1, 0, 100);
	delaySlider = new CustomSlider(0, 100, 1, 0, 100);
	velocitySlider = new CustomSlider(0, 100, 30, 1, 100);
	speedSlider = new CustomSlider(3, 20, 4, 1, 1);

	durationDiv = createDiv();
	delayDiv = createDiv();
	velocityDiv = createDiv();
	speedDiv = createDiv();

	scaleDropdown = createSelect();
	for (const scale of scales) {
		scaleDropdown.option(scale.name);
	}
	scaleDropdown.changed(newScaleSelected);

	displayNotesCheckbox = createCheckbox("Show Notes", true);

	frameRate(30);

	textAlign(CENTER, CENTER);
}

function draw() {
	background(255);
	playLine.speed = speedSlider.getValue();
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
			tSynth.triggerAttackRelease(note.note, durationSlider.getValue());
			note.canPlay = false;
		}
	});

	playLine.draw();

	durationDiv.html(`Duration: ${durationSlider.getValue()}`);
	delayDiv.html(`Delay: ${delaySlider.getValue()}`);
	velocityDiv.html(`Velocity: ${velocitySlider.getValue()}`);
	speedDiv.html(`Speed: ${speedSlider.getValue()}`);
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

	for (let col = 0; col < 16; col++) {
		for (let row = 0; row < 16; row++) {
			let note = scales[scaleSelection].notes[row % 5];
			if (row % 5 == 0) {
				octaveIncrease = row / 5;
			}
			let currentOctave = parseInt(note.slice(note.length - 1));
			note = `${note.slice(0, note.length - 1)}${
				currentOctave + octaveIncrease
			}`;

			if (initial) {
				allNotes.push(new Note(col * 32, height - 32 - row * 32, note));
			} else {
				let n = allNotes[row * 16 + col];
				n.note = note;
			}
		}
	}
}

function mousePressed() {
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
