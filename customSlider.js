class CustomSlider {
	constructor(min, max, value, step, divisor) {
		this.min = min;
		this.max = max;
		this.value = value;
		this.step = step;
		this.divisor = divisor;

		this.slider = createSlider(min, max, value, step);
	}

	getValue() {
		return this.slider.value() / this.divisor;
	}
}
