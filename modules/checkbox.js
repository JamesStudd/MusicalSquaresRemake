export default class Checkbox {
	constructor(label, defaultOption) {
		let displayNotesCheckbox = createCheckbox(label, defaultOption);
		displayNotesCheckbox.parent("mySidepanel");
		displayNotesCheckbox.class("settingsText");
		this.box = displayNotesCheckbox;
	}
}
