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

let createClient, drizzle;
if (process.env.STAGE === "DEV") {
	const libsql = require("@libsql/client");
	const drizzleOrm = require("drizzle-orm/libsql");
	createClient = libsql.createClient;
	drizzle = drizzleOrm.drizzle;
} else {
	const libsql = require("@libsql/client/web");
	const drizzleOrm = require("drizzle-orm/libsql/web");
	createClient = libsql.createClient;
	drizzle = drizzleOrm.drizzle;
}

const tursoClient = createClient({
	url: process.env.DB_URL,
	authToken: process.env.DB_KEY,
});

const getDbClient = () => {
	return tursoClient;
};

const db = drizzle(tursoClient);

const getDrizzleClient = () => {
	return db;
};

module.exports = {
	getDbClient,
	getDrizzleClient,
};
