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

// At the top of your file, add a semaphore for database connections
let activeDbConnections = 0;
const MAX_DB_CONNECTIONS = 50; // Adjust based on your database limits

// In your database operations
async function executeWithConnectionLimit(operation) {
	if (activeDbConnections >= MAX_DB_CONNECTIONS) {
		throw new Error('Too many database connections');
	}

	try {
		activeDbConnections++;
		return await operation();
	} finally {
		activeDbConnections--;
	}
}

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
					try {
						const dbPromise = functions.getDbTime(env);

						const timeoutPromise = new Promise((_, reject) => {
							setTimeout(() => reject(new Error('Operation timed out')), 150000);
						});

						const result = await Promise.race([dbPromise, timeoutPromise]);
						response = result;
					} catch (error) {
						console.error('Database error:', error);
						response = {
							status: 500,
							body: { error: 'Database operation failed', message: error.message },
						};
					}
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
						try {
							const counterPromise = functions.listCounters(env);

							const timeoutPromise = new Promise((_, reject) => {
								setTimeout(() => reject(new Error('Operation timed out')), 150000);
							});

							const result = await Promise.race([counterPromise, timeoutPromise]);

							response = {
								status: 200,
								body: { counters: result },
							};
						} catch (error) {
							console.error('Counters error:', error);
							response = {
								status: 500,
								body: { error: 'Database operation failed', message: error.message },
							};
						}
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

				// Warehouse endpoint
				case path === '/warehouse':
					console.log(`Warehouse endpoint hit with method: ${method}`);
					console.log(`Request URL: ${request.url}`);

					if (method === 'POST') {
						try {
							console.log('Parsing request body...');
							const data = await request.json();
							console.log(`Received warehouse data: ${JSON.stringify(data, null, 2)}`);

							const items = data.items || [];
							console.log(`Extracted items (count: ${items.length}): ${JSON.stringify(items, null, 2)}`);

							console.log('Calling warehouseOperation function...');
							response = await functions.warehouseOperation(env, items);
							console.log(`Warehouse operation response: ${JSON.stringify(response, null, 2)}`);
						} catch (error) {
							console.error(`ERROR in warehouse endpoint: ${error.message}`);
							console.error(`Error stack: ${error.stack}`);

							response = {
								status: 500,
								body: {
									error: 'Warehouse operation failed',
									message: error.message,
									stack: error.stack,
								},
							};
							console.log(`Error response prepared: ${JSON.stringify(response, null, 2)}`);
						}
					} else {
						console.log(`Invalid method for warehouse endpoint: ${method}`);
						return new Response(JSON.stringify({ error: 'Method not allowed' }), {
							status: 405,
							headers: {
								'Content-Type': 'application/json',
							},
						});
					}

					console.log(`Completed warehouse endpoint processing with status: ${response?.status}`);
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
