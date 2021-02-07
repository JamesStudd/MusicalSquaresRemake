function setPersistentData(cname, cvalue) {
	localStorage.setItem(cname, cvalue);
}

function getPersistentData(cname) {
	let data = localStorage.getItem(cname);
	if (data) {
		data = JSON.parse(data);
	}
	return data;
}
