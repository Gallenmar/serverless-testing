const { getDbClient } = require("../../src/db/client");
const crud = require("../../src/db/crud");

// Helper function for sleeping (used in retry logic)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const functions = {
	// Basic endpoints
	getHelloWorld: async (env) => {
		return {
			status: 200,
			body: { result: "Hello World" },
		};
	},

	getTeapot: async (env) => {
		return {
			status: 418,
			body: { message: "I'm a teapot" },
		};
	},

	// Database endpoints
	getDbTime: async (env) => {
		const db = getDbClient(env);
		const { rows } = await db.execute("SELECT datetime('now') as now");
		return {
			status: 200,
			body: { result: rows[0].now },
		};
	},

	// Database endpoints with retry logic
	getDbWithRetry: async (env, retryStrategy) => {
		const db = getDbClient(env);
		const maxRetries = 2;

		try {
			for (let attempt = 1; attempt <= maxRetries; attempt++) {
				try {
					const { rows } = await db.execute("SELECT datetime('now') as now");
					return {
						status: 200,
						body: { result: rows[0].now },
					};
				} catch (error) {
					if (
						error.code === "SERVER_ERROR" &&
						error.message.includes("429") &&
						attempt < maxRetries
					) {
						const delay = retryStrategy(attempt);
						await sleep(delay);
						console.log(`DEBUG: Rate limit exceeded, retrying in ${delay}ms`);
						continue;
					}
					throw error;
				}
			}

			return {
				status: 429,
				body: { error: "Rate limit exceeded after multiple retries" },
			};
		} catch (error) {
			console.error("Database error:", error);
			return {
				status: 500,
				body: {
					error: "Internal server error",
					message: error.message,
				},
			};
		}
	},

	// Counter endpoints
	listCounters: async (env) => {
		const counters = await crud.listCounters();
		return {
			status: 200,
			body: { counters },
		};
	},

	getCounter: async (env, id) => {
		const counter = await crud.getCounter(id);
		return {
			status: 200,
			body: { counter },
		};
	},

	createCounter: async (env, data) => {
		const counter = await crud.createCounter(data);
		return {
			status: 200,
			body: { counter },
		};
	},
};

// Retry strategies
const retryStrategies = {
	shortDelay: (attempt) => Math.random() * 1500,

	mediumDelay: (attempt) => {
		const baseDelay = 50 * Math.pow(2, attempt - 1);
		const maxDelay = 400;
		const jitter = Math.random() * baseDelay * 0.5;
		return Math.min(baseDelay + jitter, maxDelay);
	},

	longDelay: (attempt) => {
		const baseDelay = 100 * 50 * Math.pow(2, attempt - 1);
		const maxDelay = 400;
		const jitter = Math.random() * baseDelay * 0.5;
		return Math.min(baseDelay + jitter, maxDelay);
	},
};

module.exports = {
	functions,
	retryStrategies,
};
