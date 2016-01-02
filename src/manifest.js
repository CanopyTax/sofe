let cachedRemoteManifest;

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
	return new Promise((resolve, reject) => {
		let staticManifest = config.manifest || {};

		// Only request a remote manifest file once.
		if (cachedRemoteManifest) {
			return resolve(cachedRemoteManifest);
		}

		if (config.manifestUrl) {
			fetch(config.manifestUrl)
				.then((resp) => resp.json())
				.then((json) => {
					if (json && json.sofe && json.sofe.manifest) {
						cachedRemoteManifest = window.sofe.cachedRemoteManifest = { 
							...json.sofe.manifest, ...staticManifest
						};

						resolve(cachedRemoteManifest);
					} else {
						reject(
							new Error('Invalid manifest JSON: must include a sofe attribute with a manifest object')
						);
					}
				})
				.catch(() => reject(
					new Error('Invalid manifest: must be parseable JSON')
				));
		} else {
			// Resolve with no manifest if there is no config.manifest or config.manifestUrl
			resolve(staticManifest);
		}
	})
}

export function clearManifest() {
	cachedRemoteManifest = window.sofe.cachedRemoteManifest = null;
}
