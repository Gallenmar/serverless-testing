const { getEnvVars, isCloudflareWorker } = require("../../utils/getEnvVars");

let createClient, drizzle;

// Dynamic imports based on environment
// todo make sure this works in ec2
if (!isCloudflareWorker()) {
	console.log("Initializing client for Node.js environment");
	const libsql = require("@libsql/client");
	const drizzleOrm = require("drizzle-orm/libsql");
	createClient = libsql.createClient;
	drizzle = drizzleOrm.drizzle;
} else {
	console.log("Initializing client for Cloudflare Workers environment");
	const libsql = require("@libsql/client/web");
	const drizzleOrm = require("drizzle-orm/libsql/web");
	createClient = libsql.createClient;
	drizzle = drizzleOrm.drizzle;
}

let tursoClient = null;

const initializeClient = (env) => {
	const vars = getEnvVars(env);
	console.log(`Initializing client in ${vars.STAGE} environment`);

	if (!vars.DB_URL) {
		throw new Error(
			`Database URL is not configured for ${vars.STAGE} environment`
		);
	}

	tursoClient = createClient({
		url: vars.DB_URL,
		authToken: vars.DB_KEY,
	});

	return tursoClient;
};

const getDbClient = (env) => {
	if (!tursoClient) {
		initializeClient(env);
	}
	return tursoClient;
};

const getDrizzleClient = (env) => {
	if (!tursoClient) {
		initializeClient(env);
	}
	return drizzle(tursoClient);
};

module.exports = {
	getDbClient,
	getDrizzleClient,
};
