import fs from "fs";

export default async function globalSetup() {
	// Delete db.json if it exists before starting tests
	if (fs.existsSync("./TESTdb.json")) {
		fs.unlinkSync("./TESTdb.json");
		console.log("Deleted existing db.json before tests");
	}
}
