export default class Synth {
	constructor(a, d, s, r, reverbDecay, maxVoices, startVolume) {
		const rev =
			reverbDecay === -1
				? undefined
				: new Tone.Reverb({
						decay: reverbDecay,
				  }).toDestination();

		this.synth = new Tone.PolySynth({
			volume: startVolume,
			maxPolyphony: maxVoices,
		}).toDestination();

		this.synth.set({
			envelope: {
				attack: a,
				decay: d,
				sustain: s,
				release: r,
				attackCurve: "linear",
				decayCurve: "exponential",
				releaseCurve: "exponential",
			},
			oscillator: {
				type: "sine",
			},
		});

		if (rev) {
			this.synth.connect(rev);
		}

		this.minVolume = -40;
		this.maxVolume = 0;
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

	setWaveType(newWaveType) {
		this.synth.set({ oscillator: { type: newWaveType } });
	}
}
