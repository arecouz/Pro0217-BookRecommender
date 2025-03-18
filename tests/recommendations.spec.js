import { test, expect } from "@playwright/test";

test("Use recommendations", async ({ page }) => {
	test.setTimeout(60000); // 60 seconds

	// Login
	await page.goto("http://localhost:3000/");
	await page.getByRole("textbox", { name: "ENTER YOUR FIRST NAME BELOW" }).click();
	await page.getByRole("textbox", { name: "ENTER YOUR FIRST NAME BELOW" }).fill("Oskar");
	await page.getByRole("button", { name: "SUBMIT" }).click();

	// Enter a preference
	await page.getByRole("textbox", { name: "Enter your book preferences" }).click();
	await page.getByRole("textbox", { name: "Enter your book preferences" }).fill("London");
	await page.getByRole("button", { name: "SUBMIT" }).click();
	await page.getByRole("img").first().click();

	// Likes a book and wait for response
	const responsePromise = page.waitForRequest("http://localhost:3000/users/update-book");
	await page.getByRole("button", { name: "✓" }).click();
	const response = await responsePromise;

	// Go to myBooks and dislike it
	await page.getByRole("link", { name: "My Books" }).click();
	await page.getByRole("img").first().click();
	await page.getByRole("button", { name: "✕" }).click();
});
