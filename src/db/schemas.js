const { sql } = require("drizzle-orm");
const { integer, sqliteTable, text } = require("drizzle-orm/sqlite-core");

const countersTable = sqliteTable("counters", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
	count: integer("count").notNull(),
	description: text("description").notNull(),
	createdAt: text("created_at")
		.default(sql`(CURRENT_TIMESTAMP)`)
		.notNull(),
});

module.exports = {
	countersTable,
};
