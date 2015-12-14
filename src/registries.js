const CORS_URL = 'http://cors.maxogden.com/';

function getRegistryUrl(config) {
	if (config && config.registry) return config.registry;
	else return `${CORS_URL}https://registry.npmjs.org`;
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
		let registryUrl = getRegistryUrl(config);

		fetch(registryUrl + '/' + service)
			.then((resp) => resp.json())
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
							`https://npmcdn.com/${service}@${version}`
						);
					}
				}
			})
			.catch(() => reject(`Invalid registry response for service: ${service}`))
	});
}
