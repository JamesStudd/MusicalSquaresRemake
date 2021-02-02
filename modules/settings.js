export default class SynthSettings {
	constructor(polySynth) {
		let volume = getCookie(COOKIES.VOLUME) ?? DEFAULTS.VOLUME;
		const min = 0,
			max = 100,
			start = volume;

		let label = createDiv("Volume");
		label.class("settingsText");
		label.parent("sliders");

		let slider = createSlider(min, max, start);
		slider.parent(label);

		slider.input(() => {
			polySynth.setVolumeFromMap(slider.value(), min, max);
			setCookie(COOKIES.VOLUME, slider.value(), 7);
		});

		polySynth.setVolumeFromMap(volume, min, max);
	}
}
