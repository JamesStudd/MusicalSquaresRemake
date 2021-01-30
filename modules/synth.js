export default class Synth {
	constructor(a, d, s, r, reverbDecay, maxVoices, startVolume) {
		const rev =
			reverbDecay === -1
				? undefined
				: new Tone.Reverb({
						decay: reverbDecay,
				  }).toDestination();

		this.synth = new Tone.PolySynth({
			envelope: {
				attack: a,
				decay: d,
				sustain: s,
				release: r,
			},
			volume: startVolume,
			maxPolyphony: maxVoices,
		}).toDestination();

		if (rev) {
			this.synth.connect(rev);
		}

		this.synth.set({
			oscillator: {
				type: "sine",
			},
		});

		this.minVolume = -60;
		this.maxVolume = -10;
		this.mute = -100;
	}

	play(note, duration, delay) {
		this.synth.triggerAttackRelease(note.note, duration, delay);
	}

	setVolumeFromMap(volume, min, max) {
		let newVolume = map(volume, min, max, this.minVolume, this.maxVolume);
		if (newVolume === this.minVolume) newVolume = this.mute;
		this.synth.volume.value = newVolume;
	}
}
