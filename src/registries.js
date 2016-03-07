const CORS_URL = 'https://cors.maxogden.com';
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
					`file://${__dirname}/blank.js`
				);
			}

			const xhr = new XMLHttpRequest();
			xhr.addEventListener('load', xhrLoaded);
			xhr.addEventListener('error', xhrFailed);
			xhr.open('GET', requestUrl);
			xhr.send();

			function xhrLoaded() {
				if (Number(xhr.status) >= 200 && Number(xhr.status) < 300) {
					let json;
					try {
						json = JSON.parse(xhr.responseText);
					} catch(ex) {
						xhrFailed();
						return;
					}
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
				} else {
					xhrFailed();
				}
			}

			function xhrFailed() {
				reject(new Error(`Invalid registry response for service: ${service}\nRequest:${requestUrl}`))
			}
		});
	}
