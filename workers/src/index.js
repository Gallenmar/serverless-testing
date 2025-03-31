import { functions, retryStrategies } from '../../utils/functions/functions.js';
import { getEnvVars } from '../../utils/getEnvVars.js';

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const path = url.pathname;
		const method = request.method;

		try {
			// Get environment variables
			const vars = getEnvVars(env);
			let response;

			// Route handling
			switch (true) {
				// Basic endpoints
				case path === '/':
					response = await functions.getHelloWorld(env);
					break;

				case path === '/error':
					response = await functions.getTeapot(env);
					break;

				// Database endpoints
				case path === '/db':
					response = await functions.getDbTime(env);
					break;

				case path === '/dbwait/0to1500ms':
					response = await functions.getDbWithRetry(env, retryStrategies.shortDelay);
					break;

				case path === '/dbwait/100to400ms':
					response = await functions.getDbWithRetry(env, retryStrategies.mediumDelay);
					break;

				case path === '/dbwait/long':
					response = await functions.getDbWithRetry(env, retryStrategies.longDelay);
					break;

				// Counter endpoints
				case path === '/counters':
					if (method === 'GET') {
						response = await functions.listCounters(env);
					} else if (method === 'POST') {
						const data = await request.json();
						response = await functions.createCounter(env, data);
					} else {
						return new Response('Method not allowed', {
							status: 405,
							headers: {
								'Content-Type': 'application/json',
							},
						});
					}
					break;

				case /^\/counters\/[^/]+$/.test(path):
					if (method === 'GET') {
						const id = path.split('/')[2];
						response = await functions.getCounter(env, id);
					} else {
						return new Response('Method not allowed', {
							status: 405,
							headers: {
								'Content-Type': 'application/json',
							},
						});
					}
					break;

				// 404 for unmatched routes
				default:
					return new Response(JSON.stringify({ error: 'Not Found' }), {
						status: 404,
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
						},
					});
			}

			// Return the response
			return new Response(JSON.stringify(response.body), {
				status: response.status,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		} catch (error) {
			console.error('Error:', error);
			// Log environment information for debugging
			console.error('Environment:', {
				stage: getEnvVars(env).STAGE,
				mode: getEnvVars(env).MODE,
			});

			return new Response(
				JSON.stringify({
					error: 'Internal Server Error',
					message: error.message,
				}),
				{
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
					},
				}
			);
		}
	},

	// Handle OPTIONS requests for CORS
	async options(request) {
		return new Response(null, {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
			},
		});
	},
};
