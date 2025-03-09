const serverless = require("serverless-http");
const express = require("express");
const dotenv = require("dotenv");

const { getDbClient } = require("./db/client");
const crud = require("./db/crud");

dotenv.config({ path: ".env" });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res, next) => {
	const db = getDbClient();
	const { rows } = await db.execute("SELECT datetime('now') as now");
	return res.status(200).json({
		result: rows[0].now,
	});
});

app.get("/counters", async (req, res, next) => {
	const counters = await crud.listCounters();

	return res.status(200).json({
		counters,
	});
});

app.get("/counters/:id", async (req, res, next) => {
	const id = req.params.id;
	const counter = await crud.getCounter(id);

	return res.status(200).json({
		counter,
	});
});

app.post("/counters", async (req, res, next) => {
	const data = req.body;
	const counter = await crud.createCounter(data);

	return res.status(200).json({
		counter,
	});
});

app.use((req, res, next) => {
	return res.status(404).json({
		error: "Not Found",
	});
});

if (process.env.MODE === "serverless") {
	module.exports.handler = serverless(app);
} else {
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		console.log(`Server is running on port ${PORT}`);
	});
}
