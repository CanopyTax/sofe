let cachedRemoteManifest;

export function getManifest(config) {
	return new Promise((resolve, reject) => {
		if (config.manifest) {
			return resolve(config.manifest);
		}

		if (cachedRemoteManifest) {
			return resolve(cachedRemoteManifest);
		}

		if (config.manifestUrl) {
			fetch(config.manifestUrl)
				.then((resp) => resp.json())
				.then((json) => {
					if (json && json.sofe && json.sofe.manifest) {
						cachedRemoteManifest = json.sofe.manifest;
						resolve(json.sofe.manifest);
					} else {
						reject('Invalid manifest JSON: must include a sofe attribute with a manifest object');
					}
				})
				.catch(() => reject('Invalid manifest: must be parseable JSON'));
		}

		return null;
	})
}
