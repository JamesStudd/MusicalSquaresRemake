import Line from "./modules/line.js";
import Note from "./modules/note.js";
import Synth from "./modules/synth.js";
import SynthSettings from "./modules/settings.js";
import { scales } from "./setup/scales.js";
import { ParticleSystem } from "./modules/particle.js";
import Checkbox from "./modules/checkbox.js";
import Themes from "./settings/themes.js";

const SIZE_SETTINGS = {
	PC: {
		GRID_SIZE: 16,
		OFFSET: 4,
		NOTE_SIZE: 40,
	},
	MOBILE: {
		GRID_SIZE: 8,
		OFFSET: 4,
		NOTE_SIZE: 30,
	},
};

let chosenSettings = USING_MOBILE ? SIZE_SETTINGS.MOBILE : SIZE_SETTINGS.PC;
let themeIndex = 0;
let chosenTheme;

const { GRID_SIZE, OFFSET, NOTE_SIZE } = chosenSettings;

let allNotes = [];
let playLine;
let scaleSelection = 0;
let activatingNotes = false;

const synth = new Synth(
	0.05,
	0.1,
	0.5,
	0.2,
	USING_MOBILE ? -1 : 2,
	USING_MOBILE ? 10 : 128,
	USING_MOBILE ? -10 : -10
);

let particleSystem;
let displayLine = false;
let displayParticles = true;

window.setup = function () {
	let cnv = createCanvas(NOTE_SIZE * GRID_SIZE, NOTE_SIZE * GRID_SIZE);
	cnv.parent("sketch-holder");

	frameRate(60);
	textAlign(CENTER, CENTER);

	// Sound setup
	if (USING_MOBILE) {
		Tone.setContext + new Tone.Context({ latencyHint: "interactive" });
	}
	Tone.Transport.start("+0.1");

	// UI elements
	let scaleDropdown = createSelect();
	for (let i = 0; i < scales.length; i++) {
		const scale = scales[i];
		scaleDropdown.option(scale.name);
		if (scale.default) {
			scaleDropdown.selected(scale.name);
			scaleSelection = i;
		}
	}
	scaleDropdown.changed(() => newScaleSelected(scaleDropdown.value()));
	scaleDropdown.parent("mySidepanel");
	scaleDropdown.class("settingOption");

	new Checkbox("Show Notes", false).box.changed(() =>
		allNotes.forEach((note) => note.toggleDisplayNotes())
	);

	new Checkbox("Show Particles", true).box.changed(
		() => (displayParticles = !displayParticles)
	);

	new Checkbox("Show Line", false).box.changed(
		() => (displayLine = !displayLine)
	);

	let button = createButton("Clear");
	button.parent("mySidepanel");
	button.class("mobileOnly");
	button.mousePressed(clearNotes);

	if (!USING_MOBILE) new SynthSettings(synth);

	changeTheme();

	// Grid setup
	setupGrid(true);
	playLine = new Line(USING_MOBILE ? 11 : 3.5);

	// Particles
	particleSystem = new ParticleSystem(createVector(width / 2, 50));
};

window.draw = function () {
	background(chosenTheme.background);
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
			synth.play(
				note,
				USING_MOBILE ? "16n" : "8n",
				USING_MOBILE ? "+0.05" : undefined
			);
			note.canPlay = false;
			if (displayParticles) {
				particleSystem.addParticle(
					note.x + note.size / 2,
					note.y + note.size / 2,
					chosenTheme.particle
				);
			}
		}
	});

	if (displayLine) playLine.draw();
	if (displayParticles) particleSystem.run();
};

window.mousePressed = function () {
	if ((mouseX === 0 && mouseY === 0) || (USING_MOBILE && !isClosed)) return;
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
	if ((mouseX === 0 && mouseY === 0) || (USING_MOBILE && !isClosed)) return;
	let note = getSingleNoteFromMousePos();
	if (note) {
		note.active = activatingNotes;
	}
};

window.keyPressed = function () {
	// Spacebar
	if (keyCode === 32) {
		clearNotes();
	}
	// 't'
	if (keyCode === 84) {
		themeIndex = themeIndex + 1 >= Themes.length ? 0 : themeIndex + 1;
		changeTheme();
	}
};

function clearNotes() {
	allNotes.forEach((note) => {
		note.active = false;
	});
}

function changeTheme() {
	chosenTheme = Themes[themeIndex];
	let { background, settings, text } = chosenTheme;

	document.body.style.setProperty(
		"background-color",
		background,
		"important"
	);

	let elem = document.getElementById("mySidepanel").style;
	elem.setProperty("background-color", settings.background);
	//elem.setProperty("border", `1px solid ${settings.border}`);

	let buttonEle = document.getElementById("toggleButton").style;
	buttonEle.setProperty("background-color", settings.background);
	buttonEle.setProperty("border", `1px solid ${settings.border}`);

	let texts = document.getElementsByClassName("settingsText");
	for (const t of texts) {
		t.style.setProperty("color", text);
	}

	allNotes.forEach((note) => (note.noteTheme = chosenTheme.note));
}

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
						note,
						NOTE_SIZE - OFFSET * 2,
						chosenTheme.note
					)
				);
			} else {
				let n = allNotes[col * GRID_SIZE + row];
				n.note = note;
			}
		}
	}
}
