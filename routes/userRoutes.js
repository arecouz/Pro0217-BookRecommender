import express from "express";
const router = express.Router();
import {
	getUsers,
	getUser,
	createUser,
	updateBook,
	updatePending,
	updateFriend,
	updateInbox,
	updateUser,
	deleteUser,
} from "../controllers/userController.js";

router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/add", createUser);
router.post("/update-book", updateBook);
router.post("/update-pending", updatePending);
router.post("/update-friend", updateFriend);
router.post("/update-inbox", updateInbox);
router.get("/update/:id", updateUser);
router.get("/delete/:id", deleteUser);

export { router as userRoutes };
