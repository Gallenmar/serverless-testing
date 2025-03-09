const { createClient } = require("@libsql/client/web");
const { drizzle } = require("drizzle-orm/libsql/web");

const dotenv = require("dotenv");

dotenv.config({ path: ".env" });
console.log("STAGE:", process.env.STAGE);
if (process.env.STAGE === "DEV") {
	console.log("Using dev environment");
	dotenv.config({ path: ".env.dev" });
} else if (process.env.STAGE === "PROD") {
	console.log("Using prod environment");
	dotenv.config({ path: ".env.prod" });
} else {
	console.log("Stage not set");
}

const tursoClient = createClient({
	url: process.env.DB_URL,
	authToken: process.env.DB_KEY,
});

const getDbClient = () => {
	return tursoClient;
};

const db = drizzle({
	client: tursoClient,
});

const getDrizzleClient = () => {
	return db;
};

module.exports = {
	getDbClient,
	getDrizzleClient,
};
