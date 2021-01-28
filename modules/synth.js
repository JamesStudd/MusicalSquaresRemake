export default class Synth {
	constructor(a, d, s, r, reverbDecay) {
		const rev = new Tone.Reverb({
			decay: reverbDecay,
		}).toDestination();

		this.synth = new Tone.PolySynth({
			envelope: {
				attack: a,
				decay: d,
				sustain: s,
				release: r,
			},
			maxPolyphony: 48,
			volume: -20,
		})
			.connect(rev)
			.toDestination();

		this.synth.set({
			oscillator: {
				type: "sine",
			},
		});
	}

	play(note) {
		this.synth.triggerAttackRelease(note.note, "8n");
	}
}