const inboxBtn = document.querySelector(".inbox-btn");
const lightsDownOverlay = document.querySelector(".lights-down-overlay");
const inbox = document.querySelector(".inbox");
const closeBtn = document.querySelector(".close-btn");

const openInbox = () => {
	lightsDownOverlay.classList.remove("hidden");
	inbox.classList.remove("hidden");
	getMessages();
};

const closeInbox = () => {
	lightsDownOverlay.classList.add("hidden");
	inbox.classList.add("hidden");
};

inboxBtn.addEventListener("click", openInbox);
closeBtn.addEventListener("click", closeInbox);

let messages;

const getMessages = async () => {
	// Get current user's inbox content
	const userInfo = await fetch(`/users/${currentUserID}`);
	if (!userInfo.ok) {
		console.error("Failed to fetch user info");
		return;
	}
	const userData = await userInfo.json();
	messages = userData.inbox;
	displayMessages();
};

const displayMessages = async () => {
	if (document.querySelector(".message")) {
		document.querySelector(".message").remove(); // delete all displayed messages so as to refresh inbox
	}

	// Create message elements and append them to inbox element
	for (let i = 0; i < messages.length; i++) {
		// Get user data for message sender from database
		const senderInfo = await fetch(`/users/${messages[i].id}`);
		if (!senderInfo.ok) {
			console.error("Failed to fetch sender's user data");
			return;
		}
		const senderData = await senderInfo.json();

		const message = document.createElement("div");
		message.id = `${messages[i].type}-from-user-${messages[i].id}`;
		message.classList.add("message");

		let messageContent;

		switch (messages[i].type) {
			case "friend_request":
				messageContent = `${senderData.username} sent you a friend request!`;
				break;
			case "request_accepted":
				messageContent = `${senderData.username} accepted your friend request!`;
				break;
			default:
				messageContent = `${senderData.username} rejected your friend request.`;
		}

		message.innerHTML =
			messages[i].type === "friend_request"
				? `
            <p>${messageContent}</p>
            <div class="options">
                <button class="accept" onclick="acceptFriendRequest(${messages[i].id})">✓</button>
				<button class="reject" onclick="rejectFriendRequest(${messages[i].id})">✕</button>
			</div>
        `
				: `
            <p>${messageContent}</p>
            <div class="options">
				<button class="delete-message-btn" onclick="deleteMessage(${messages[i].id}, '${messages[i].type}')">✕</button>
			</div>
        `;

		inbox.appendChild(message);
	}
};

const acceptFriendRequest = async (selectedMessageID) => {
	document.getElementById(`friend_request-from-user-${selectedMessageID}`).remove();

	// Add sender to current user's friend list
	const dataToSend1 = {
		user_id: currentUserID,
		friend_id: selectedMessageID,
		key: "friends",
		add: true,
	};

	// Remove current user from sender's pending friend list
	const dataToSend2 = {
		user_id: selectedMessageID,
		friend_id: parseInt(currentUserID),
		key: "pending",
		add: false,
	};

	// Add current user to sender's friend list
	const dataToSend3 = {
		user_id: selectedMessageID,
		friend_id: parseInt(currentUserID),
		key: "friends",
		add: true,
	};

	// Remove message from current user's "inbox" array
	const messageToDelete = {
		addressee_id: currentUserID,
		sender_id: selectedMessageID,
		message_type: "friend_request",
		key: "inbox",
		add: false,
	};

	// Send acceptance message to sender's inbox (i.e. add new acceptance message to sender's "inbox" array)
	const messageToSend = {
		addressee_id: selectedMessageID,
		sender_id: parseInt(currentUserID),
		message_type: "request_accepted",
		key: "inbox",
		add: true,
	};

	fetch("/users/update-friend", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(dataToSend1),
	})
		.then(() => {
			return fetch("/users/update-pending", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(dataToSend2),
			});
		})
		.then(() => {
			return fetch("/users/update-friend", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(dataToSend3),
			});
		})
		.then(() => {
			return fetch("/users/update-inbox", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(messageToDelete),
			});
		})
		.then(() => {
			return fetch("/users/update-inbox", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(messageToSend),
			});
		})
		.then(() => {
			clearFriendsAndRemainingUsersContainers();
			getFriendsAndRemainingUsers();
		});
};

const rejectFriendRequest = async (selectedMessageID) => {
	document.getElementById(`friend_request-from-user-${selectedMessageID}`).remove();

	// Remove current user from sender's pending friend list
	const dataToSend = {
		user_id: selectedMessageID,
		friend_id: parseInt(currentUserID),
		key: "pending",
		add: false,
	};

	// Remove message from current user's "inbox" array
	const messageToDelete = {
		addressee_id: currentUserID,
		sender_id: selectedMessageID,
		message_type: "friend_request",
		key: "inbox",
		add: false,
	};

	// Send rejection message to sender's inbox (i.e. add new rejection message to sender's "inbox" array)
	const messageToSend = {
		addressee_id: selectedMessageID,
		sender_id: parseInt(currentUserID),
		message_type: "request_rejected",
		key: "inbox",
		add: true,
	};

	fetch("/users/update-pending", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(dataToSend),
	})
		.then(() => {
			return fetch("/users/update-inbox", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(messageToDelete),
			});
		})
		.then(() => {
			return fetch("/users/update-inbox", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(messageToSend),
			});
		});
};

const deleteMessage = async (selectedMessageID, selectedMessageType) => {
	document.getElementById(`${selectedMessageType}-from-user-${selectedMessageID}`).remove();

	const messageToDelete = {
		addressee_id: currentUserID,
		sender_id: selectedMessageID,
		message_type: selectedMessageType,
		key: "inbox",
		add: false,
	};

	fetch("/users/update-inbox", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(messageToDelete),
	})
		.then((response) => response.json())
		.catch((error) => {
			console.error("Error:", error);
		});
};
