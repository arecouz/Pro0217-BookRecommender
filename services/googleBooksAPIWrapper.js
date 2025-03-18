export async function fetchBooks(titles) {
	const requests = titles.map((title) => {
		return fetch(
			`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}`,
		).then((response) => response.json());
	});

	try {
		const books = await Promise.all(requests);
		return books;
	} catch (error) {
		console.error("Error fetching books:", error);
	}
}

export async function fetchBooksByIDs(IDs) {
	const requests = IDs.map(async (id) => {
		const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
		return await response.json();
	});

	try {
		const books = await Promise.all(requests);
		return books;
	} catch (error) {
		console.error("Error fetching books:", error);
	}
}

export function completeBookWithCoverAndID(booksInfoFromGoogleBooks, recommendations) {
	let coverURLSandGoogleBooksID = [];
	if (booksInfoFromGoogleBooks && booksInfoFromGoogleBooks.length > 0) {
		coverURLSandGoogleBooksID = booksInfoFromGoogleBooks.map((book, i) => ({
			cover:
				book.items?.[0]?.volumeInfo?.imageLinks?.thumbnail ||
				`https://placehold.co/128x170?text=${encodeURIComponent(recommendations.books[i].title)}`,
			id: book.items?.[0]?.id,
		}));
	} else {
		console.log("No books found.");
	}

	for (let i = 0; i < recommendations.books.length; i++) {
		recommendations.books[i].cover = coverURLSandGoogleBooksID[i].cover;
		recommendations.books[i].id = coverURLSandGoogleBooksID[i].id;
	}
}
