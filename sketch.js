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
let themeIndex = getCookie(COOKIES.THEME) ?? 0;
let chosenTheme;

const { GRID_SIZE, OFFSET, NOTE_SIZE } = chosenSettings;

let allNotes = [];
let playLine;
let scaleSelection = getCookie(COOKIES.SCALE) ?? DEFAULTS.SCALE_INDEX;
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

const lineDirections = [
	[-1, 0],
	[0, -1],
	[1, 0],
	[0, 1],
];
let lineDirectionIndex = 2;

let particleSystem;
let displayLine = getCookie(COOKIES.SHOW_LINE) ?? DEFAULTS.SHOW_LINE;
let displayParticles =
	getCookie(COOKIES.SHOW_PARTICLES) ?? DEFAULTS.SHOW_PARTICLES;

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
		if (i === scaleSelection) {
			scaleDropdown.selected(scale.name);
		}
	}
	scaleDropdown.changed(() => {
		newScaleSelected(scaleDropdown.value());
		for (let i = 0; i < scales.length; i++) {
			if (scales[i].name === scaleDropdown.value()) {
				setCookie(COOKIES.SCALE, i, 7);
				return;
			}
		}
	});
	scaleDropdown.parent("mySidepanel");
	scaleDropdown.class("settingOption");

	let showNote = getCookie("displayNotes") ?? false;
	let showNoteCheckbox = new Checkbox("Show Notes", showNote);
	showNoteCheckbox.box.changed(() => {
		allNotes.forEach((note) => note.toggleDisplayNotes());
		setCookie("displayNotes", showNoteCheckbox.box.checked(), 7);
	});

	let showParticlesCheckbox = new Checkbox(
		"Show Particles",
		displayParticles
	);
	showParticlesCheckbox.box.changed(() => {
		displayParticles = !displayParticles;
		setCookie(
			COOKIES.SHOW_PARTICLES,
			showParticlesCheckbox.box.checked(),
			7
		);
	});

	let showLineCheckbox = new Checkbox("Show Line", displayLine);
	showLineCheckbox.box.changed(() => {
		displayLine = !displayLine;
		setCookie(COOKIES.SHOW_LINE, showLineCheckbox.box.checked(), 7);
	});

	let button = createButton("Clear");
	button.parent("mySidepanel");
	button.class("mobileOnly");
	button.mousePressed(clearNotes);

	if (!USING_MOBILE) new SynthSettings(synth);

	changeTheme();

	// Grid setup
	setupGrid(true);
	playLine = new Line(USING_MOBILE ? 11 : 3.5);
	changeLineDir();

	// Particles
	particleSystem = new ParticleSystem(createVector(width / 2, 50));
};

window.draw = function () {
	background(chosenTheme.background);
	playLine.update(deltaTime);

	if (playLine.needsResetting()) {
		playLine.reset();
		resetNotes();
	}

	allNotes.forEach((note) => {
		note.draw();
		if (
			note.active &&
			note.canPlay &&
			note.isLineOver(playLine.pos, playLine.dir)
		) {
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

	// Left, Up, Right, Down
	if (keyCode === 37 || keyCode === 38 || keyCode === 39 || keyCode === 40) {
		lineDirectionIndex = keyCode - 37;
		changeLineDir();
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
	setCookie(COOKIES.THEME, themeIndex, 7);
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

function changeLineDir() {
	let d = lineDirections[lineDirectionIndex];
	playLine.setNewDir(d[0], d[1]);
	resetNotes();
}

function resetNotes() {
	allNotes.forEach((note) => (note.canPlay = true));
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
