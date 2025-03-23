import http from "k6/http";
import { check } from "k6";

const local = "http://localhost:3000/counters/";
const lambda = "https://qnlzsbk4ri.execute-api.us-east-1.amazonaws.com/db/";
const ec2 = "http://3.95.212.207:3000/db/";
const url = ec2;

export function setup() {
	console.log(`Testing URL: ${url}`);
}

export const options = {
	vus: 1000,
	duration: "10s",
};

export default function () {
	const response = http.get(url);
	let status = 0;
	if (
		!check(response, {
			"status was 200": (res) => {
				status = res.status;
				return res.status == 200;
			},
		})
	) {
		console.log(status);
	}
}
