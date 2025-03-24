import http from "k6/http";
import { check, sleep } from "k6";

const local = "http://localhost:3000/counters/";
const lambda = "https://qnlzsbk4ri.execute-api.us-east-1.amazonaws.com/db/";
const ec2 = "http://3.95.212.207:3000/db/";
const url = lambda;

export function setup() {
	console.log(`Testing URL: ${url}`);
}

export const options = {
	vus: 1000,
	duration: "10s",
};

function makeRequestWithRetry(url, maxRetries = 3) {
	let attempts = [];
	const startTime = new Date();
	let cumulativeTime = 0;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		const requestStart = new Date();
		const response = http.get(url);
		const requestEnd = new Date();
		const duration = requestEnd - requestStart;
		cumulativeTime += duration;

		attempts.push({
			attempt,
			duration,
			cumulativeTime,
			status: response.status,
			timestamp: requestStart.toISOString(),
		});

		if (response.status !== 500) {
			console.log(
				`${startTime.toISOString()},${attempt},${duration},${cumulativeTime},${
					response.status
				},success`
			);
			return response;
		}

		if (attempt < maxRetries) {
			const delay = Math.random() * 0.1;
			console.log(
				`${startTime.toISOString()},${attempt},${duration},${cumulativeTime},${
					response.status
				},retry`
			);
			sleep(delay);
			cumulativeTime += delay * 1000;
			continue;
		}
	}

	const finalResponse = http.get(url);
	const finalDuration = new Date() - startTime;
	const finalCumulativeTime = cumulativeTime + finalDuration;
	console.log(
		`${startTime.toISOString()},${maxRetries},${finalDuration},${finalCumulativeTime},${
			finalResponse.status
		},failed`
	);
	return finalResponse;
}

export default function () {
	const response = makeRequestWithRetry(url);

	check(response, {
		"status is 200": (r) => r.status === 200,
		"response has data": (r) => r.json("result") !== undefined,
	});

	sleep(1);
}
