function setPersistentData(cname, cvalue) {
	localStorage.setItem(cname, cvalue);
}

function getPersistentData(cname) {
	let data = localStorage.getItem(cname);
	if (data) {
		try {
			data = JSON.parse(data);
		} catch {}
	}
	return data;
}
