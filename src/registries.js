function getRegistryUrl(config) {
	if (config && config.registry) return config.registry;
	else return 'http://cors.maxogden.com/https://registry.npmjs.org';
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
				let sofe = json.versions[json['dist-tags'].latest].sofe;

				if (sofe && sofe.url) {
					resolve(sofe.url);
				} else {
					reject(`Invalid service on registry. Needs a sofe parameter. Check service: ${service}`);
				}
			})
			.catch(() => reject(`Invalid registry response for service: ${service}`))
	});
}
