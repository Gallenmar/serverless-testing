const { getDrizzleClient } = require("./client");
const { countersTable } = require("./schemas");
const { eq } = require("drizzle-orm");

async function createCounter(data, env) {
	console.log("createCounter hit with data:", JSON.stringify(data, null, 2));
	const db = getDrizzleClient(env);
	try {
		const counter = await db.insert(countersTable).values(data).returning();
		console.log("Counter created successfully:", counter);
		return counter;
	} catch (error) {
		console.error("Error creating counter:", error);

		if (error.message.includes("Too Many Connections")) {
			console.warn("Potential rate limiting detected.");
		}

		throw error;
	}
}

async function listCounters(env) {
	const db = getDrizzleClient(env);

	const timeoutPromise = new Promise((_, reject) => {
		setTimeout(() => reject(new Error("Database operation timed out")), 150000); // 5 second timeout
	});

	try {
		const counters = await Promise.race([
			db.select().from(countersTable).limit(10),
			timeoutPromise,
		]);
		console.log("listCounters hit", counters);
		return counters;
	} catch (error) {
		console.error("listCounters error:", error);
		throw error;
	}
}

async function getCounter(id, env) {
	const db = getDrizzleClient(env);
	const counter = await db
		.select()
		.from(countersTable)
		.where(eq(countersTable.id, id));
	console.log("getCounter hit", counter);
	return counter;
}

module.exports = {
	createCounter,
	listCounters,
	getCounter,
};
