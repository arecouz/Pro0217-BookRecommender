const librarySign = document.querySelector(".library-sign");
const registrationForm = document.querySelector(".registration-form");

registrationForm.onsubmit = (e) => {
	e.preventDefault();
	let username = document.getElementById("first-name-input").value;

	localStorage.setItem("username", username);
	librarySign.style.opacity = 0;
	registrationForm.style.opacity = 0;

	setTimeout(() => {
		librarySign.remove();
		registrationForm.remove();
		document.getElementById("library-front").style.opacity = 0;
		pageTransitionFunc("/library-interior/");
	}, 2000);

	createUser();
};

async function createUser() {
	let username = localStorage.getItem("username");

	try {
		const response = await fetch("/users/add", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username: username }),
		});
		let json = await response.json();
		console.log(json);
		localStorage.setItem("userID", json["id"]);
	} catch (error) {
		console.error("Error:", error);
	}
}
