// Helper to check which environment we're running in
const isCloudflareWorker = (env) => {
	console.log("Checking if we're running in Cloudflare Workers");
	return true; // TODO: Make a robust check for Cloudflare Workers env
};

// Helper to get environment stage
const getStage = (env) => {
	if (isCloudflareWorker(env)) {
		return env?.STAGE || "NONE1";
	}
	const stage = process.env.STAGE || "NONE2";
	if (stage === "NONE2") {
		const dotenv = require("dotenv");
		dotenv.config();
		return process.env.STAGE || "NONE3";
	} else {
		return stage;
	}
};

// Main environment variables getter
const getEnvVars = (env) => {
	const stage = getStage(env);
	console.log("STAGE:", stage);

	// For Cloudflare Workers
	if (isCloudflareWorker()) {
		return {
			STAGE: stage,
			MODE: env?.MODE || "workers",
			DB_URL: env?.DB_URL,
			DB_KEY: env?.DB_KEY,
			DB_DIALECT: env?.DB_DIALECT || "turso",
			PORT: env?.PORT || 3000,
		};
	}

	// For Node.js (Express/Lambda)
	return {
		STAGE: stage,
		MODE: process.env.MODE || "serverless",
		DB_URL: process.env.DB_URL,
		DB_KEY: process.env.DB_KEY,
		DB_DIALECT: process.env.DB_DIALECT || "turso",
		PORT: process.env.PORT || 3000,
	};
};

module.exports = {
	getEnvVars,
	isCloudflareWorker,
	getStage,
};
