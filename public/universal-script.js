const doorCreak = new Audio("/door-creaking.mp3");

document.addEventListener("DOMContentLoaded", () => {
	const darkness = document.getElementById("darkness");
	if (!darkness) return; // page don't have darkness

	darkness.style.opacity = 0;
	setTimeout(() => {
		darkness.classList.add("hidden");
	}, 2000);
});

const pageTransitionFunc = (destination) => {
	doorCreak.addEventListener("ended", () => {
		window.location.href = destination;
	});
	setTimeout(() => {
		doorCreak.play();
	}, 2000);
};

const interactionAnimation = (likeOrDislike, bookDiv) => {
	switch (likeOrDislike) {
		case "like":
		case "dislike":
			bookDiv.classList.add("jump-highlight-" + likeOrDislike);
			bookDiv.style.width = bookDiv.offsetWidth + "px";
			bookDiv.style.height = bookDiv.offsetHeight + "px";
			bookDiv.style.margin = "0";

			setTimeout(() => {
				bookDiv.classList.remove("jump-highlight-" + likeOrDislike);
				bookDiv.style.opacity = "0";
				bookDiv.style.width = "0";
				bookDiv.style.height = "0";
				bookDiv.style.margin = "-10px";
				bookDiv.style.borderWidth = "0";
			}, 500);

			setTimeout(() => {
				bookDiv.remove();
			}, 1500);
			break;
		default:
			throw new Error("bad argument passed to interactionAnimation");
	}
};

const judgementPassed = async (key, book, add = true) => {
	const dataToSend = {
		user_id: localStorage.getItem("userID"),
		book: book,
		key: key,
		add: add,
	};

	try {
		const response = await fetch("/users/update-book", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(dataToSend),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json();
	} catch (error) {
		console.error("Error:", error.message);
		throw error; // Rethrow to let the caller handle it
	}
};

const createButtonElements = (bookDiv, index, book, fetchUsersBooks) => {
	const librarianDialogue = document.querySelector(".dialogue-div");

	// Create buttons container
	const buttonsDiv = document.createElement("div");
	buttonsDiv.classList.add("book-buttons");

	// Create accept button
	const acceptBtn = document.createElement("button");
	acceptBtn.classList.add("accept");
	acceptBtn.innerHTML = "✓";
	acceptBtn.addEventListener("click", async (e) => {
		e.stopPropagation();
		interactionAnimation("like", bookDiv);
		librarianDialogue.innerHTML = `<p>Good choice! I'll add "${book.title}" to your reading list!<p>`;
		await judgementPassed("likes", book);

		if (fetchUsersBooks != undefined) fetchUsersBooks();
	});
	acceptBtn.addEventListener("mouseenter", () => {
		librarianDialogue.innerHTML = `<p>Interested, I can add it to your reading list?</p>`;
	});

	// Create reject button
	const rejectBtn = document.createElement("button");
	rejectBtn.classList.add("reject");
	rejectBtn.innerHTML = "✕";
	rejectBtn.addEventListener("click", (e) => {
		e.stopPropagation();
		interactionAnimation("dislike", bookDiv);
		judgementPassed("dislikes", book);
		librarianDialogue.innerHTML = `<p>Got it! I won't recommend books like "${book.title}" going forward! <p>`;
	});
	rejectBtn.addEventListener("mouseenter", () => {
		librarianDialogue.innerHTML = `<p>Not a fan of ${book.title}? I can remember to not recommend similar books in the future?</p>`;
	});

	buttonsDiv.appendChild(acceptBtn);
	buttonsDiv.appendChild(rejectBtn);
	bookDiv.appendChild(buttonsDiv);
};
const createBookElements = (data, length, bookRecommendationContainer, fetchUsersBooks) => {
	const librarianDialogue = document.querySelector(".dialogue-div");

	// Convert array to data object if needed
	data = Array.isArray(data) ? { books: data } : data;

	for (let i = 0; i < length; i++) {
		const book = data.books[i];
		const bookDiv = document.createElement("div");
		bookDiv.classList.add("book");

		//add image
		const img = document.createElement("img");
		img.src = book.cover;
		img.alt = book.title;
		bookDiv.appendChild(img);
		// Add mouseover event for book info
		bookDiv.addEventListener("mouseover", () => {
			librarianDialogue.innerHTML = `<p>${book.title}, by ${book.author} was released in ${book.year}. ${book.reason_for_recommendation}</p>`;
		});

		createButtonElements(bookDiv, i, book, fetchUsersBooks);
		bookRecommendationContainer.appendChild(bookDiv);
	}
};
