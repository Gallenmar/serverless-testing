import http from "k6/http";
import { check } from "k6";

const local = "http://localhost:3000/";
const lambda = "https://paste your url here.eu-central-1.amazonaws.com/";
const lambda_us = "https://paste your url here.us-east-1.amazonaws.com/";
const ec2 = "http://paste your url here/";
const worker = "https://paste your url here.workers.dev/";
const url = worker + "warehouse";

export function setup() {
	console.log(`Testing URL: ${url}`);
}

export const options = {
	stages: [
		{ duration: "10s", target: 50 },
		{ duration: "10s", target: 100 },
		{ duration: "10s", target: 500 },
	],
};

export default function () {
	// Test the warehouse endpoint
	const warehousePayload = JSON.stringify({
		items: [
			{ id: "item1", name: "Widget A", quantity: 5 },
			{ id: "item2", name: "Widget B", quantity: 10 },
			{ id: "item3", name: "Widget C", quantity: 3 },
		],
	});

	const params = {
		headers: {
			"Content-Type": "application/json",
		},
	};

	// Debug log: request information
	console.log("==== REQUEST DEBUG ====");
	console.log(`Sending request to: ${url}`);
	console.log(`Payload: ${warehousePayload}`);

	try {
		// Make the warehouse POST request
		const warehouseResponse = http.post(url, warehousePayload, params);

		// Debug log: response information
		console.log("==== RESPONSE DEBUG ====");
		console.log(`Response status: ${warehouseResponse.status}`);
		console.log(
			`Response headers: ${JSON.stringify(warehouseResponse.headers)}`
		);
		console.log(`Raw response body: ${warehouseResponse.body}`);

		// Try to parse the body and log it
		try {
			const parsedBody = JSON.parse(warehouseResponse.body);
			console.log(`Parsed body: ${JSON.stringify(parsedBody, null, 2)}`);
		} catch (parseError) {
			console.log(`Error parsing response body: ${parseError.message}`);
			console.log(`Response is not valid JSON`);
		}

		// Debug log: timing information
		console.log("==== TIMING DEBUG ====");
		console.log(`Total request time: ${warehouseResponse.timings.duration}ms`);
		console.log(`Time to first byte: ${warehouseResponse.timings.waiting}ms`);

		// Check response status and structure
		const checkResults = check(warehouseResponse, {
			"warehouse status was 200": (res) => res.status === 200,
			"response has result field": (res) => {
				try {
					return JSON.parse(res.body).result !== undefined;
				} catch (e) {
					console.log(`Error checking result field: ${e.message}`);
					return false;
				}
			},
			"response has processedItems": (res) => {
				try {
					return Array.isArray(JSON.parse(res.body).processedItems);
				} catch (e) {
					console.log(`Error checking processedItems: ${e.message}`);
					return false;
				}
			},
			"all items were processed": (res) => {
				const body = JSON.parse(res.body);
				return body.processedItems && body.processedItems.length === 3;
			},
		});

		// Optionally log detailed results if needed
		// console.log(`Warehouse response time: ${warehouseResponse.timings.duration}ms`);
		// console.log(`Processing time: ${JSON.parse(warehouseResponse.body).processingTimeMs}ms`);
	} catch (error) {
		console.log(`Error making request: ${error.message}`);
	}
}
