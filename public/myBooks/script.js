const username = localStorage.getItem("username");
const userId = localStorage.getItem("userID");

const createMyBooksElements = (books, bookContainer, id_reason_dict) => {
	const librarianDialogue = document.querySelector(".dialogue-div");

	for (let i = 0; i < books.length; i++) {
		const book = books[i];
		const bookDiv = document.createElement("div");
		bookDiv.classList.add("book");

		//add image
		const img = document.createElement("img");
		img.src = book.cover;
		img.alt = book.title;
		bookDiv.appendChild(img);

		// Add mouseover event for book info
		bookDiv.addEventListener("mouseover", () => {
			if (librarianDialogue) {
				librarianDialogue.innerHTML = `
				<p>${book.title}, by ${book.author} was released in ${book.year}.</p>
				<p>Reason: ${id_reason_dict[book.id] || "No reason provided."}</p>
			  `;
			}
		});

		// Create remove button
		const buttonsDiv = document.createElement("div");
		buttonsDiv.classList.add("book-buttons");

		const removeBtn = document.createElement("button");
		removeBtn.classList.add("reject");
		removeBtn.innerHTML = "✕";
		removeBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			judgementPassed("likes", book, false);
			bookDiv.remove();
			if (librarianDialogue) {
				librarianDialogue.innerHTML = `<p>I've removed "${book.title}" from your reading list.</p>`;
			}
		});
		removeBtn.addEventListener("mouseenter", () => {
			if (librarianDialogue) {
				librarianDialogue.innerHTML = `<p>Would you like to remove "${book.title}" from your reading list?</p>`;
			}
		});

		buttonsDiv.appendChild(removeBtn);
		bookDiv.appendChild(buttonsDiv);
		bookContainer.appendChild(bookDiv);
	}
};

if (username) {
	document.getElementById("readingListTitle").textContent = `${username}'s Reading List`;
}

async function fetchUsersBooks() {
	const userInfo = await fetch(`/users/${userId}`);
	if (!userInfo.ok) {
		console.error("Failed to fetch user info");
		return;
	}
	const userData = await userInfo.json();

	if (userData.likes.length > 0) {
		// Fetch book details using the likes array
		const book_ids = userData.likes.map((bookData) => bookData.id);
		const response = await fetch("/books/fetchBooksByIDs", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ids: book_ids }),
		});

		if (!response.ok) {
			console.error("Failed to fetch book details");
			return;
		}
		const id_reason_dict = Object.fromEntries(
			userData.likes.map(({ id, reason }) => [id, reason]),
		);
		const books = await response.json();
		const bookContainer = document.getElementById("my-books-container");
		bookContainer.replaceChildren(); //delete all current children (in case this container is being refreshed)
		createMyBooksElements(books, bookContainer, id_reason_dict);
	} else {
		// No books to display
		const midSection = document.querySelector(".mid-section");
		midSection.innerHTML = "<h3>No books</h3>";
		const librarianDialogue = document.querySelector(".dialogue-div");
		librarianDialogue.innerHTML = `<p>Oh no! You haven't liked any books yet, when you do I'll be sure to keep track.</p>`;
	}
}

async function fetchUserRecommendation() {
	const response = await fetch(`/recommendations/byUserPreferences/${userId}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	});

	const data = await response.json();
	const bookRecommendationContainer = document.getElementById("my-recommendations-container");
	const length = 4;
	createBookElements(data, length, bookRecommendationContainer, fetchUsersBooks);

	const recomendationsText = document.querySelector("#recomendations-text");
	recomendationsText.innerHTML = `<p>Based on your reading list you might like these!</p>`;
}

fetchUsersBooks();
fetchUserRecommendation();
