const { createClient } = require("@libsql/client/web");
const { drizzle } = require("drizzle-orm/libsql/web");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.prod" });

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
