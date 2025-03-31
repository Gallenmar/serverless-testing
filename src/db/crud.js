const { getDrizzleClient } = require("./client");
const { countersTable } = require("./schemas");
const { eq } = require("drizzle-orm");

async function createCounter(data, env) {
	const db = getDrizzleClient(env);
	const counter = await db.insert(countersTable).values(data).returning();
	console.log("createCounter hit", counter);
	return counter;
}

async function listCounters(env) {
	const db = getDrizzleClient(env);
	const counters = await db.select().from(countersTable).limit(10);
	console.log("listCounters hit", counters);
	return counters;
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
