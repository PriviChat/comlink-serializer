const path = require('path');
// ... imports or other code up here ...

/**
 * Function that mutates the original webpack config.
 * Supports asynchronous changes when a promise is returned (or it's an async function).
 *
 * @param {import('preact-cli').Config} config - original webpack config
 * @param {import('preact-cli').Env} env - current environment and options pass to the CLI
 * @param {import('preact-cli').Helpers} helpers - object with useful helpers for working with the webpack config
 * @param {Record<string, unknown>} options - this is mainly relevant for plugins (will always be empty in the config), default to an empty object
 */
export default (config, env, helpers, options) => {
	/** you can change the config here **/
	const rules = helpers.getRules(config);

	/* update node */
	const node = config.node || {};
	Object.assign(node, {
		crypto: true,
		Buffer: true,
		process: true,
		fs: 'empty',
	});
	config.node = node;

	/* update fallback webpack 5 */
	//const fallback = config.resolve.fallback || {};
	//Object.assign(fallback, {
	//  "stream": require.resolve("stream-browserify"),
	//});
	//config.resolve.fallback = fallback;
};
