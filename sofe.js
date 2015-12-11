var systemLocate = System.locate;
var cachedRemoteManifest;

function getRegistryUrl() {
	var config = System.sofe;
	if (config && config.registry) return config.registry;
	else return 'http://cors.maxogden.com/https://registry.npmjs.org';
}

function getServiceName(load) {
	var a = document.createElement('a');
	a.href = load.address;
	var service = a.pathname;
	if (service[0] === '/') service = service.substring(1);
	return service;
}

function getManifest() {
	return new Promise(function(resolve, reject) {
		var config = System.sofe;
		if (config.manifest) {
			return resolve(config.manifest);
		}

		if (cachedRemoteManifest) {
			return resolve(cachedRemoteManifest);
		}

		if (config.manifestUrl) {
			fetch(config.manifestUrl)
				.then(function(resp) {
					return resp.json();
				})
				.then(function(json) {
					if (json && json.sofe && json.sofe.manifest) {
						cachedRemoteManifest = json.sofe.manifest;
						resolve(json.sofe.manifest);
					} else {
						reject('Invalid manifest JSON: must include a sofe attribute with a manifest object');
					}
				})
				.catch(() => {
					reject('Invalid manifest: must be parseable JSON');
				});
		}

		return null;
	})
}

function getUrlFromRegistry(service) {
	return new Promise(function(resolve, reject) {
		let registryUrl = getRegistryUrl();

		fetch(registryUrl + '/' + service)
			.then(function(resp) {
				return resp.json();
			})
			.then(function(json) {
				let sofe = json.versions[json['dist-tags'].latest].sofe;

				if (sofe && sofe.url) {
					resolve(sofe.url);
				} else {
					reject('Invalid service on registry. Needs a sofe parameter. Check service: ' + service);
				}
			})
			.catch(function() {
				reject('Invalid registry response for service: ' + service);
			})
	});
}

exports.locate = function(load) {

	var service = getServiceName(load);

	return new Promise(function(resolve, reject) {
		getManifest()
			.then(function(manifest) {
				if (manifest && manifest[service]) {
					resolve(manifest[service]);
				} else {
					getUrlFromRegistry(service)
						.then(function(url) {
							resolve(url);
						})
						.catch(function(error) {
							throw new Error(error);
						});
				}
			})
			.catch(function(error) {
				throw new Error(error);
			});
	})
}
