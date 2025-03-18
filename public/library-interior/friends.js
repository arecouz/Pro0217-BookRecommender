const currentUser = localStorage.getItem("username");
const currentUserID = localStorage.getItem("userID");

// Dropdown list visibility
const addFriendOption = document.querySelector(".add-friend");
const remainingUsersContainer = document.querySelector(".remaining-users");

addFriendOption.onmouseenter = () => {
	remainingUsersContainer.classList.remove("hidden");
};

addFriendOption.onmouseleave = () => {
	if (remainingUsersContainer.matches(":hover")) {
		return;
	} else {
		remainingUsersContainer.classList.add("hidden");
	}
};

remainingUsersContainer.onmouseleave = () => {
	if (addFriendOption.matches(":hover")) {
		return;
	} else {
		remainingUsersContainer.classList.add("hidden");
	}
};

const friendsContainer = document.querySelector(".friends");
let allUserIDs = [];
let friendIDs;
let remainingUserIDs;

const clearFriendsAndRemainingUsersContainers = () => {
	for (let i = 1; i < friendsContainer.children.length; i++) {
		friendsContainer.children[i].remove();
	}

	remainingUsersContainer.replaceChildren();
};

const getFriendsAndRemainingUsers = async () => {
	// Get all users' IDs
	const response = await fetch(`/users/`);
	const allUsers = await response.json();
	let allUserIDs = [];
	for (let i = 0; i < allUsers.length; i++) {
		allUserIDs.push(allUsers[i].id);
	}

	// Get current user's friends' IDs
	const userInfo = await fetch(`/users/${currentUserID}`);
	if (!userInfo.ok) {
		console.error("Failed to fetch user info");
		return;
	}
	const userData = await userInfo.json();
	friendIDs = userData.friends;

	remainingUserIDs = allUserIDs.filter((user) => !friendIDs.includes(user));
	// Remove own ID from list of remaining users' IDs
	remainingUserIDs.splice(remainingUserIDs.indexOf(parseInt(currentUserID)), 1);

	linksToFriendsLists();
	referencesToRemainingUsers();
};

// Create links to friends' reading lists
const linksToFriendsLists = async () => {
	for (let i = 0; i < friendIDs.length; i++) {
		const friendInfo = await fetch(`/users/${friendIDs[i]}`);
		if (!friendInfo.ok) {
			console.error("Failed to fetch friend info");
			return;
		}
		const friendData = await friendInfo.json();

		// Add 'friend' element in displayed friends list (containing link to friend's reading list and unfriend button)
		const friend = document.createElement("div");
		friend.id = `${friendData.id}-element`;
		friend.innerHTML = `<a id="link-for-user-${friendData.id}" href="../theirBooks/">${friendData.username}<a>`;
		friend.classList.add("friend");
		friendsContainer.appendChild(friend);

		document.getElementById(`link-for-user-${friendData.id}`).addEventListener("click", () => {
			localStorage.setItem("friendUsername", `${friendData.username}`);
			localStorage.setItem("friendUserID", `${friendData.id}`);
		});

		const unfriendBtn = document.createElement("button");
		unfriendBtn.id = `unfriend-user-${friendData.id}`;
		unfriendBtn.innerText = "✕";
		unfriendBtn.classList.add("unfriend-btn");
		unfriendBtn.classList.add("hidden");
		unfriendBtn.addEventListener("click", () => {
			removeFriend(friendData.id);
		});
		document.getElementById(`${friendData.id}-element`).appendChild(unfriendBtn);

		document.getElementById(`${friendData.id}-element`).onmouseenter = () => {
			document.getElementById(`unfriend-user-${friendData.id}`).classList.remove("hidden");
		};

		document.getElementById(`${friendData.id}-element`).onmouseleave = () => {
			document.getElementById(`unfriend-user-${friendData.id}`).classList.add("hidden");
		};
	}
};

// Create options to add remaining users as friends
const referencesToRemainingUsers = async () => {
	// Get current user's pending IDs
	const userInfo = await fetch(`/users/${currentUserID}`);
	if (!userInfo.ok) {
		console.error("Failed to fetch user info");
		return;
	}
	const userData = await userInfo.json();
	pendingIDs = userData.pending;

	for (let i = 0; i < remainingUserIDs.length; i++) {
		const remainingUserInfo = await fetch(`/users/${remainingUserIDs[i]}`);
		if (!remainingUserInfo.ok) {
			console.error("Failed to fetch remaining user info");
			return;
		}
		const remainingUserData = await remainingUserInfo.json();

		// Add 'link' for remaining user
		const remainingUser = document.createElement("div");
		remainingUser.id = `${remainingUserData.id}-element`;
		remainingUser.classList.add("remaining-user");
		remainingUser.innerHTML = `<a href="#">${remainingUserData.username}</a>`;
		remainingUsersContainer.appendChild(remainingUser);

		const hourglassIcon = document.createElement("img");
		hourglassIcon.src = "../images/hourglass.gif";
		hourglassIcon.classList.add("hourglass-icon");
		hourglassIcon.id = `hourglass-for-${remainingUserData.id}`;

		if (!pendingIDs.includes(remainingUserIDs[i])) {
			hourglassIcon.classList.add("hidden");
		}

		document.getElementById(`${remainingUserData.id}-element`).appendChild(hourglassIcon);

		remainingUser.addEventListener("click", () => {
			sendFriendRequest(remainingUserData.id);
		});
	}
};

// Send new friend request
const sendFriendRequest = async (selectedUserID) => {
	// Check if you've already sent a friend request to the selected user and if so, exit function
	const userInfo = await fetch(`/users/${currentUserID}`);
	if (!userInfo.ok) {
		console.error("Failed to fetch user info");
		return;
	}
	const userData = await userInfo.json();
	pendingIDs = userData.pending;

	if (pendingIDs.includes(selectedUserID)) {
		return;
	}

	// Add selected user ID to current user's pending friends list
	const dataToSend = {
		user_id: currentUserID,
		friend_id: selectedUserID,
		key: "pending",
		add: true,
	};

	fetch("/users/update-pending", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(dataToSend),
	})
		.then((response) => response.json())
		.catch((error) => {
			console.error("Error:", error);
		});

	// Show hourglass icon for selected user
	document.getElementById(`hourglass-for-${selectedUserID}`).classList.remove("hidden");

	// Add new friend request message to selected user's inbox
	const messageToSend = {
		addressee_id: selectedUserID,
		sender_id: parseInt(currentUserID),
		message_type: "friend_request",
		key: "inbox",
		add: true,
	};

	fetch("/users/update-inbox", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(messageToSend),
	})
		.then((response) => response.json())
		.catch((error) => {
			console.error("Error:", error);
		});
};

// Add new friend
const addNewFriend = async (selectedUserID) => {
	// Get new friend's data from database
	const newFriendInfo = await fetch(`/users/${selectedUserID}`);
	if (!newFriendInfo.ok) {
		console.error("Failed to fetch remaining user info");
		return;
	}
	const newFriendData = await newFriendInfo.json();

	// Add new 'friend' element in displayed friends list (containing link to new friend's reading list and unfriend button)
	const newFriend = document.createElement("div");
	newFriend.id = `${newFriendData.id}-element`;
	newFriend.innerHTML = `<a id="link-for-user-${newFriendData.id}" href="../theirBooks/">${newFriendData.username}<a>`;
	newFriend.classList.add("friend");
	friendsContainer.appendChild(newFriend);

	document.getElementById(`link-for-user-${newFriendData.id}`).addEventListener("click", () => {
		localStorage.setItem("friendUsername", `${newFriendData.username}`);
		localStorage.setItem("friendUserID", `${newFriendData.id}`);
	});

	const unfriendBtn = document.createElement("button");
	unfriendBtn.id = `unfriend-user-${newFriendData.id}`;
	unfriendBtn.innerText = "✕";
	unfriendBtn.classList.add("unfriend-btn");
	unfriendBtn.classList.add("hidden");
	unfriendBtn.addEventListener("click", () => {
		removeFriend(newFriendData.id);
	});
	document.getElementById(`${newFriendData.id}-element`).appendChild(unfriendBtn);

	document.getElementById(`${newFriendData.id}-element`).onmouseenter = () => {
		document.getElementById(`unfriend-user-${newFriendData.id}`).classList.remove("hidden");
	};

	document.getElementById(`${newFriendData.id}-element`).onmouseleave = () => {
		document.getElementById(`unfriend-user-${newFriendData.id}`).classList.add("hidden");
	};
};

// Remove friend
const removeFriend = async (selectedUserID) => {
	// Remove selected user ID from current user's friends array
	const dataToSend = {
		user_id: currentUserID,
		friend_id: selectedUserID,
		key: "friends",
		add: false,
	};

	fetch("/users/update-friend", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(dataToSend),
	})
		.then((response) => response.json())
		.catch((error) => {
			console.error("Error:", error);
		});

	// Remove link from user's friends list
	document.getElementById(`${selectedUserID}-element`).remove();

	// Get estranged friend's data from database
	const estrangedFriendInfo = await fetch(`/users/${selectedUserID}`);
	if (!estrangedFriendInfo.ok) {
		console.error("Failed to fetch remaining user info");
		return;
	}
	const estrangedFriendData = await estrangedFriendInfo.json();

	// Create 'link' for user in list of remaining users
	const estrangedFriend = document.createElement("div");
	estrangedFriend.id = `${estrangedFriendData.id}-element`;
	estrangedFriend.classList.add("remaining-user");
	estrangedFriend.innerHTML = `<a href ="#">${estrangedFriendData.username}</a>`;
	remainingUsersContainer.appendChild(estrangedFriend);
	estrangedFriend.addEventListener("click", () => {
		addNewFriend(estrangedFriendData.id);
	});

	const hourglassIcon = document.createElement("img");
	hourglassIcon.src = "../images/hourglass.gif";
	hourglassIcon.classList.add("hourglass-icon");
	hourglassIcon.classList.add("hidden");

	document.getElementById(`${estrangedFriendData.id}-element`).appendChild(hourglassIcon);
};

getFriendsAndRemainingUsers();
