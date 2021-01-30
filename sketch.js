import Line from "./modules/line.js";
import Note from "./modules/note.js";
import Synth from "./modules/synth.js";
import SynthSettings from "./modules/settings.js";
import { scales } from "./setup/scales.js";
import { Particle, ParticleSystem } from "./modules/particle.js";

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

const BACKGROUND_COLOR = [18, 41, 44];
const USING_MOBILE = mobileCheck();

let chosenSettings = USING_MOBILE ? SIZE_SETTINGS.MOBILE : SIZE_SETTINGS.PC;

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
	USING_MOBILE ? 10 : 64,
	USING_MOBILE ? -10 : -30
);

let particleSystem;

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
	let button = createButton("Clear");
	button.parent("settings");
	button.class("mobileOnly");
	button.mousePressed(clearNotes);

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
	scaleDropdown.parent("settings");
	scaleDropdown.class("settingOption");

	let displayNotesCheckbox = createCheckbox("Show Notes", false);
	displayNotesCheckbox.parent("settings");
	displayNotesCheckbox.class("settingOption");
	displayNotesCheckbox.changed(() =>
		allNotes.forEach((note) => note.toggleDisplayNotes())
	);

	// Grid setup
	setupGrid(true);
	playLine = new Line(USING_MOBILE ? 11 : 3.5);

	if (!USING_MOBILE) new SynthSettings(synth);

	// Particles
	particleSystem = new ParticleSystem(createVector(width / 2, 50));
};

window.draw = function () {
	background(BACKGROUND_COLOR);
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
			particleSystem.addParticle(note.x, note.y);
		}
	});

	playLine.draw();

	particleSystem.run();
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
		clearNotes();
	}
};

function mobileCheck() {
	let check = false;
	(function (a) {
		if (
			/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
				a
			) ||
			/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
				a.substr(0, 4)
			)
		)
			check = true;
	})(navigator.userAgent || navigator.vendor || window.opera);
	return check;
}

function clearNotes() {
	allNotes.forEach((note) => {
		note.active = false;
	});
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
						NOTE_SIZE - OFFSET * 2
					)
				);
			} else {
				let n = allNotes[col * GRID_SIZE + row];
				n.note = note;
			}
		}
	}
}
