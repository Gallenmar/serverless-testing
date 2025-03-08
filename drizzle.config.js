const { defineConfig } = require("drizzle-kit");

module.exports = defineConfig({
	dialect: process.env.DB_DIALECT,
	schema: "./src/db/schemas.js",
	dbCredentials: {
		url: process.env.DB_URL,
		authToken: process.env.DB_KEY,
	},
});
