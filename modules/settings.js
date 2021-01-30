export default class SynthSettings {
	constructor(polySynth) {
		const min = 0,
			max = 100,
			start = 60;

		let label = createDiv("Volume");
		label.class("sliderLabel");
		label.parent("sliders");

		let slider = createSlider(min, max, start);
		slider.parent(label);

		slider.input(() =>
			polySynth.setVolumeFromMap(slider.value(), min, max)
		);
	}
}
