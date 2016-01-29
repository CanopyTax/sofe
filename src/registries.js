const CORS_URL = 'http://cors.maxogden.com';
const NPM_CDN = 'https://npmcdn.com';
const hasWindow = typeof window !== 'undefined';

function getRegistryUrl(config) {
	if (config && config.registry) return config.registry;
	else return `${CORS_URL}/https://registry.npmjs.org`;
}

/**
 * Get the url from an npm registry.
 *
 * @param {String} service The name of the service that is being resolved
 * @param {Object} config The sofe config object
 * @return {Promise} A promise which resolves with the service url
 */
	export function getUrlFromRegistry(service, config) {
		return new Promise(function(resolve, reject) {
			const requestUrl = getRegistryUrl(config) + '/' + service;

			if (!hasWindow) {
				return resolve(
					`file://${process.cwd()}/blank.js`
				);
			}

			fetch(requestUrl)
				.then((resp) => {
					if (resp.status >= 200 && resp.status < 300) {
						return resp.json();
					} else {
						return Promise.reject(new Error(resp.statusText || resp.status));
					}
				})
				.then((json) => {
					if (json.sofe) {
						// The registry is a simple sofe registry
						resolve(json.sofe.url);
					} else {
						// The registry is an NPM registry
						const version = json['dist-tags'].latest;
						const pkg = json.versions[version];

						if (pkg.sofe && pkg.sofe.url) {
							resolve(pkg.sofe.url);
						} else {
							resolve(
								`${NPM_CDN}/${service}@${version}`
							);
						}
					}
				})
				.catch(() => reject(new Error(`Invalid registry response for service: ${service}\nRequest:${requestUrl}`)))
		});
	}
