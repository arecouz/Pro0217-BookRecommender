import { test, expect } from "@playwright/test";

test("Create user", async ({ page }) => {
	// Login as Oskar
	await page.goto("http://localhost:3000/");
	await page.getByRole("textbox", { name: "ENTER YOUR FIRST NAME BELOW" }).click();
	await page.getByRole("textbox", { name: "ENTER YOUR FIRST NAME BELOW" }).fill("Oskar");
	await page.getByRole("button", { name: "SUBMIT" }).click();

	// Logout
	await page.getByRole("link", { name: "Log out" }).click();

	// Login as Henson
	await page.getByRole("textbox", { name: "ENTER YOUR FIRST NAME BELOW" }).click();
	await page.getByRole("textbox", { name: "ENTER YOUR FIRST NAME BELOW" }).fill("Henson");
	await page.getByRole("button", { name: "SUBMIT" }).click();

	// Add Oskar as friend
	await page.getByText("My Friends").click();
	await page.getByText("Add friend").click();
	await page.getByRole("link", { name: "Oskar" }).click();

	// Open Oskar page
	await page.getByRole("link", { name: "Oskar" }).click();
});
