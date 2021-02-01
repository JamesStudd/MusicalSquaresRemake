/* Set the width of the sidebar to 250px (show it) */
let isClosed = false;

function toggleNav() {
	document.getElementById("sideMaster").style.marginLeft = isClosed
		? "0"
		: "-300px";
	document.getElementById("toggleButton").innerHTML = isClosed ? "<<" : ">>";
	isClosed = !isClosed;
}
