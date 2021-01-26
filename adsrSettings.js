class ADSRSettings {
	constructor(vals) {
		this.vals = vals;
		for (let i = 0; i < this.vals.length; i++) {
			this.createAndSubscribeToDiv(
				new CustomSlider(0, 100, this.vals[i] * 100, 0, 100),
				i
			);
		}
	}

	createAndSubscribeToDiv(slider, i) {
		let newDiv = createDiv(slider.getValue());
		slider.slider.input(() => {
			let val = slider.getValue().toFixed(2);
			this.vals[i] = val;
			newDiv.html(val);
			let [a, d, s, r] = this.vals;
			polySynth.setADSR(a, d, s, r);
		});
	}
}
