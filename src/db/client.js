const { createClient } = require("@libsql/client/web");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.dev" });
console.log(process.env.DB_URL);
const turso = createClient({
	url: process.env.DB_URL,
	authToken: process.env.DB_KEY,
});

const getDbClient = () => {
	return turso;
};

module.exports = getDbClient;
