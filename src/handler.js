const serverless = require("serverless-http");
const express = require("express");
const app = express();
const getDbClient = require("./db/client");

app.get("/", async (req, res, next) => {
	const db = getDbClient();
	const { rows } = await db.execute("SELECT datetime('now') as now");
	return res.status(200).json({
		message: "Hello from root!",
		result: rows[0].now,
	});
});

app.get("/counters", (req, res, next) => {
	return res.status(200).json({
		message: "Hello from path!",
	});
});

app.use((req, res, next) => {
	return res.status(404).json({
		error: "Not Found",
	});
});

// app.listen(3000, () => {
// 	console.log("Server is running on port 3000");
// });

exports.handler = serverless(app);
