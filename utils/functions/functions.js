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
					const counters = await crud.listCounters(env);
					return {
						status: 200,
						body: { counters },
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
		const counters = await crud.listCounters(env);
		return {
			status: 200,
			body: { counters },
		};
	},

	getCounter: async (env, id) => {
		const counter = await crud.getCounter(id, env);
		return {
			status: 200,
			body: { counter },
		};
	},

	createCounter: async (env, data) => {
		const counter = await crud.createCounter(data, env);
		return {
			status: 200,
			body: { counter },
		};
	},

	// Add to the functions object
	warehouseOperation: async (env, items) => {
		console.log("=== WAREHOUSE OPERATION STARTING ===");
		console.log(
			`Input items (${items?.length || 0}): ${JSON.stringify(items, null, 2)}`
		);
		console.log(
			`Environment context: ${env ? "Provided" : "Not provided (null)"}`
		);

		try {
			console.log("Getting database client...");
			const db = getDbClient(env);
			console.log("Database client obtained successfully");

			// Simulate heavy computation
			const startTime = Date.now();
			console.log(
				`Starting warehouse computation at: ${new Date(
					startTime
				).toISOString()}`
			);

			// Simulated intensive calculation
			console.log("Beginning intensive calculation loop...");
			let computationResult = 0;
			for (let i = 0; i < 1000000; i++) {
				computationResult += Math.sqrt(i * Math.random());
			}
			console.log(
				`Intensive calculation completed: ${computationResult.toFixed(2)}`
			);

			// First database operation - get current inventory
			console.log("Executing first database query (timestamp)...");
			const inventoryQueryStartTime = Date.now();
			const { rows: inventoryRows } = await db.execute(
				"SELECT datetime('now') as timestamp"
			);
			console.log(
				`Database query executed in ${Date.now() - inventoryQueryStartTime}ms`
			);
			const timestamp = inventoryRows[0].timestamp;
			console.log(`Retrieved timestamp: ${timestamp}`);

			// Simulate processing delay
			console.log("Simulating processing delay...");
			await sleep(100);
			console.log("Processing delay completed");

			// Second database operation - get counters to simulate checking stock levels
			console.log("Executing second database query (counters)...");
			const countersQueryStartTime = Date.now();
			const counters = await crud.listCounters(env);
			console.log(
				`Counters query executed in ${Date.now() - countersQueryStartTime}ms`
			);
			console.log(`Retrieved ${counters?.length || 0} counters`);

			// Process the items with the inventory data
			console.log("Processing items with inventory data...");
			const processedItems = items.map((item) => {
				const stockLevel = Math.floor(Math.random() * 100);
				console.log(`Processing item ${item.id}: stock level ${stockLevel}`);
				return {
					...item,
					processed: true,
					processingTime: Date.now() - startTime,
					inventoryTimestamp: timestamp,
					availableStock: stockLevel,
				};
			});
			console.log(`All ${processedItems.length} items processed`);

			const totalProcessingTime = Date.now() - startTime;
			console.log(`Total processing time: ${totalProcessingTime}ms`);

			console.log("=== WAREHOUSE OPERATION COMPLETED SUCCESSFULLY ===");
			return {
				status: 200,
				body: {
					result: "Warehouse operation completed",
					processingTimeMs: totalProcessingTime,
					calculationValue: computationResult.toFixed(2),
					processedItems,
					inventoryCheckedAt: timestamp,
				},
			};
		} catch (error) {
			console.error("=== WAREHOUSE OPERATION ERROR ===");
			console.error(`Error type: ${error.name}`);
			console.error(`Error message: ${error.message}`);
			console.error(`Error stack: ${error.stack}`);

			if (error.code) {
				console.error(`Error code: ${error.code}`);
			}

			// Check for specific error types
			if (error.message.includes("Too Many Connections")) {
				console.error("DATABASE CONNECTION LIMIT REACHED");
			}

			return {
				status: 500,
				body: {
					error: "Warehouse operation failed",
					errorType: error.name,
					message: error.message,
					code: error.code,
				},
			};
		}
	},
};

// Retry strategies
const retryStrategies = {
	shortDelay: (attempt) => Math.random() * 400,

	mediumDelay: (attempt) => Math.random() * 1000,

	longDelay: (attempt) => Math.random() * 40000,
};

module.exports = {
	functions,
	retryStrategies,
};
