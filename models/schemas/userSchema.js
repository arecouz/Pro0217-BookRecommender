import { z } from "zod";

const bookID = z.string();
export const friendID = z.number();

export const bookUserDataSchema = z.object({
	id: z.string(),
	reason: z.string(),
});

export const messageSchema = z.object({
	id: z.number(),
	type: z.string(),
});

export const userSchema = z.object({
	username: z.string(),
	id: z.number().default(0),
	likes: z.array(bookUserDataSchema).default([]),
	dislikes: z.array(bookUserDataSchema).default([]),
	pending: z.array(friendID).default([]),
	friends: z.array(friendID).default([]),
	inbox: z.array(messageSchema).default([]),
});

export const usersSchema = z.array(userSchema);
