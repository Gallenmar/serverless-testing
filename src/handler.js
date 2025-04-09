const serverless = require("serverless-http");
const express = require("express");
const { getEnvVars } = require("../utils/getEnvVars");
const { functions, retryStrategies } = require("../utils/functions/functions");

const vars = getEnvVars(null); // null for Node.js environment

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic endpoints
app.get("/", async (req, res) => {
	const response = await functions.getHelloWorld(null);
	return res.status(response.status).json(response.body);
});

app.get("/error", async (req, res) => {
	const response = await functions.getTeapot(null);
	return res.status(response.status).json(response.body);
});

// Database endpoints
app.get("/db", async (req, res) => {
	const response = await functions.getDbTime(null);
	return res.status(response.status).json(response.body);
});

app.get("/dbwait/0to1500ms", async (req, res) => {
	const response = await functions.getDbWithRetry(
		null,
		retryStrategies.shortDelay
	);
	return res.status(response.status).json(response.body);
});

app.get("/dbwait/long", async (req, res) => {
	const response = await functions.getDbWithRetry(
		null,
		retryStrategies.longDelay
	);
	return res.status(response.status).json(response.body);
});

app.get("/dbwait/100to400ms", async (req, res) => {
	const response = await functions.getDbWithRetry(
		null,
		retryStrategies.mediumDelay
	);
	return res.status(response.status).json(response.body);
});

// Counter endpoints
app.get("/counters", async (req, res) => {
	const response = await functions.listCounters(null);
	return res.status(response.status).json(response.body);
});

app.get("/counters/:id", async (req, res) => {
	const response = await functions.getCounter(null, req.params.id);
	return res.status(response.status).json(response.body);
});

app.post("/counters", async (req, res) => {
	const response = await functions.createCounter(null, req.body);
	return res.status(response.status).json(response.body);
});

app.post("/warehouse", async (req, res) => {
	const items = req.body.items || [];
	const response = await functions.warehouseOperation(null, items);
	return res.status(response.status).json(response.body);
});

// 404 handler
app.use((req, res) => {
	return res.status(404).json({
		error: "Not Found",
	});
});

if (vars.MODE === "serverless") {
	console.log("Running in serverless mode", vars.MODE);
	module.exports.handler = serverless(app);
} else {
	console.log("Running in another mode", vars.MODE);
	const PORT = vars.PORT;
	app.listen(PORT, "0.0.0.0", () => {
		console.log(`Server is running on port ${PORT}`);
	});
}
