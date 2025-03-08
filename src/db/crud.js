const { getDrizzleClient } = require("./client");
const { countersTable } = require("./schemas");
const { eq } = require("drizzle-orm");

async function createCounter(data) {
	const db = getDrizzleClient();
	const counter = await db.insert(countersTable).values(data).returning();
	console.log("createCounter hit", counter);
	return counter;
}

async function listCounters() {
	const db = getDrizzleClient();
	const counters = await db.select().from(countersTable).limit(10);
	console.log("listCounters hit", counters);
	return counters;
}

async function getCounter(id) {
	const db = getDrizzleClient();
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
