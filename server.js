// server.js
import express from "express";
const app = express();
app.use(express.json()); // Middleware to parse JSON bodie
import { setupSwagger } from "./swagger.js";

const PORT = process.env.PORT || 3000;

// Register Swagger
setupSwagger(app);

import jsonServer from "json-server";
import fs from "fs";
import path from "path";
import url from "url";

import { recommendRoutes } from "./routes/recommendRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";
import { bookRoutes } from "./routes/bookRoutes.js";

//CRUD operations for recommendations
app.use("/recommendations", recommendRoutes);

//CRUD operations for users
app.use("/users", userRoutes);

//CRUD operations for books
app.use("/books", bookRoutes);

//Setup json-server so fetchAPI() can make use of it
//First, check if such file exists
let json_file = "db.json";
if (process.env.NODE_ENV === "test") {
	json_file = "TESTdb.json";
	console.log("Using test database...");
}
fs.open(json_file, "r", function (error) {
	if (error) {
		//File dont exists, create one with empty json list
		const json = {
			users: [],
			books: [],
		};

		fs.writeFile(json_file, JSON.stringify(json), { flag: "wx" }, function (error) {
			if (error) throw error;

			//After file created, setup router
			app.use("/api", jsonServer.router(json_file));
		});
	} else {
		//File already exists, setup router
		app.use("/api", jsonServer.router(json_file));
	}
});

app.set("views", "public");

app.use(function (req, res, next) {
	if (req.url.includes(".") || req.url.includes("/api/")) {
		next(); // ignore it, not to be rendered as a html file
	} else {
		// default values to pass through ejs templates

		// head.ejs
		res.locals.title = "Book Recommender";
		res.locals.icon = "book-open";
		res.locals.styles = [];

		// navbar.ejs
		res.locals.url = req.url;

		// substring(1) is to remove "/" at start of path
		res.render(path.join(req.url, "index.ejs").substring(1));
	}
});

app.use(express.static("public")); // This auto-adds public/index.html to the "/" page

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
