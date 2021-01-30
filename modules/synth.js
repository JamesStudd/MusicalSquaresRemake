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
			volume: -30,
		})
			.connect(rev)
			.toDestination();

		this.synth.set({
			oscillator: {
				type: "sine",
			},
		});

		this.minVolume = -60;
		this.maxVolume = -10;
		this.mute = -100;
	}

	play(note) {
		this.synth.triggerAttackRelease(note.note, "8n");
	}

	setVolumeFromMap(volume, min, max) {
		let newVolume = map(volume, min, max, this.minVolume, this.maxVolume);
		if (newVolume === this.minVolume) newVolume = this.mute;
		this.synth.volume.value = newVolume;
	}
}
