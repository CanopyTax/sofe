let cachedRemoteManifest;
const hasWindow = typeof window !== 'undefined';
let fetchManifestPromise = null;

/**
 * Asynchronously find a manifest for resolving sofe services. The manifest is a simple
 * map where key values represent unique services and the values represent a URL
 * to load the service. If there is no available manifest, sofe will default to
 * querying npm for service resolution.
 *
 * @param {Object} config the sofe configuration object
 * @return {Promise} A promise which is resolved with a service manifest.
 */
export function getManifest(config) {
	// Don't fetch the manifest twice
	if (fetchManifestPromise) {
		return fetchManifestPromise;
	}

	const promise = new Promise((resolve, reject) => {
		let staticManifest = config.manifest || {};

		// Only request a remote manifest file once.
		if (cachedRemoteManifest) {
			return resolve(cachedRemoteManifest);
		}

		if (config.manifestUrl && hasWindow) {
			const xhr = new XMLHttpRequest();
			xhr.addEventListener('load', xhrLoaded);
			xhr.addEventListener('error', xhrFailed);
			xhr.open('GET', config.manifestUrl);
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
					if (json && json.sofe && json.sofe.manifest) {
						cachedRemoteManifest = {
							...json.sofe.manifest, ...staticManifest
						};

						if (hasWindow) {
							window.sofe.cachedRemoteManifest = cachedRemoteManifest;
						}

						resolve(cachedRemoteManifest);
					} else {
						fetchManifestPromise = null;
						reject(
							new Error('Invalid manifest JSON: must include a sofe attribute with a manifest object')
						);
					}
				}
			}

			function xhrFailed() {
				fetchManifestPromise = null;
				reject(
					new Error('Invalid manifest: must be parseable JSON')
				);
			}
		} else {
			// Resolve with no manifest if there is no config.manifest or config.manifestUrl
			resolve(staticManifest);
		}
	});

	fetchManifestPromise = promise;

	return promise;
}

export function clearManifest() {
	cachedRemoteManifest = window.sofe.cachedRemoteManifest = null;
}
