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
	return res.status(200).json({
		result: "Hello World",
	});
});

app.get("/error", async (req, res, next) => {
	return res.status(418).json({
		message: "I'm a teapot",
	});
});

app.get("/db", async (req, res, next) => {
	const db = getDbClient();
	const { rows } = await db.execute("SELECT datetime('now') as now");
	return res.status(200).json({
		result: rows[0].now,
	});
});

app.get("/dbwait/0to1500ms", async (req, res, next) => {
	const db = getDbClient();

	const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	const maxRetries = 2;

	try {
		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				const { rows } = await db.execute("SELECT datetime('now') as now");
				return res.status(200).json({
					result: rows[0].now,
				});
			} catch (error) {
				if (
					error.code === "SERVER_ERROR" &&
					error.message.includes("429") &&
					attempt < maxRetries
				) {
					// Random delay between 0-1500ms
					const delay = Math.random() * 1500;
					await sleep(delay);
					console.log(`DEBUG: Rate limit exceeded, retrying in ${delay}ms`);
					continue;
				}
				throw error;
			}
		}

		return res.status(429).json({
			error: "Rate limit exceeded after multiple retries",
		});
	} catch (error) {
		console.error("Database error:", error);
		return res.status(500).json({
			error: "Internal server error",
			message: error.message,
		});
	}
});

app.get("/dbwait/long", async (req, res, next) => {
	const db = getDbClient();

	const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	const maxRetries = 2;

	try {
		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				const { rows } = await db.execute("SELECT datetime('now') as now");
				return res.status(200).json({
					result: rows[0].now,
				});
			} catch (error) {
				if (
					error.code === "SERVER_ERROR" &&
					error.message.includes("429") &&
					attempt < maxRetries
				) {
					// Wait between 10000-40000ms with exponential backoff and jitter
					const baseDelay = 100 * 50 * Math.pow(2, attempt - 1);
					const maxDelay = 400;
					const jitter = Math.random() * baseDelay * 0.5;
					const delay = Math.min(baseDelay + jitter, maxDelay);
					await sleep(delay);
					console.log(`DEBUG: Rate limit exceeded, retrying in ${delay}ms`);
					continue;
				}
				throw error;
			}
		}

		return res.status(429).json({
			error: "Rate limit exceeded after multiple retries",
		});
	} catch (error) {
		console.error("Database error:", error);
		return res.status(500).json({
			error: "Internal server error",
			message: error.message,
		});
	}
});

app.get("/dbwait/100to400ms", async (req, res, next) => {
	const db = getDbClient();

	const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	const maxRetries = 2;

	try {
		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			try {
				const { rows } = await db.execute("SELECT datetime('now') as now");
				return res.status(200).json({
					result: rows[0].now,
				});
			} catch (error) {
				if (
					error.code === "SERVER_ERROR" &&
					error.message.includes("429") &&
					attempt < maxRetries
				) {
					// Wait between 100-400ms with exponential backoff and jitter
					const baseDelay = 50 * Math.pow(2, attempt - 1);
					const maxDelay = 400;
					const jitter = Math.random() * baseDelay * 0.5;
					const delay = Math.min(baseDelay + jitter, maxDelay);
					await sleep(delay);
					console.log(`DEBUG: Rate limit exceeded, retrying in ${delay}ms`);
					continue;
				}
				throw error;
			}
		}

		return res.status(429).json({
			error: "Rate limit exceeded after multiple retries",
		});
	} catch (error) {
		console.error("Database error:", error);
		return res.status(500).json({
			error: "Internal server error",
			message: error.message,
		});
	}
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
	app.listen(PORT, "0.0.0.0", () => {
		console.log(`Server is running on port ${PORT}`);
	});
}
