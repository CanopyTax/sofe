import { getServiceName, resolvePathFromService } from './utils.js';
import { getUrlFromRegistry } from './registries.js';
import { getManifest, clearManifest } from './manifest.js';
import { stepMiddleware } from './middleware.js';

const config = System.sofe || {};

const systemNormalize = System.normalize;
const systemLocate = System.locate;

const hasWindow = typeof window !== 'undefined';

let allMiddleware = [];
let serviceMap = {};
let serviceOverrides = [];
let middlewareMap = {};
let middlewareId = 0;
let middlewareTracker = 0;

/**
 * Override the default System.normalize
 *
 * This is done to recognize when we are loading a dependency of a sofe service and
 * allow the dependency to load relative to the parent service.
 */
export function normalize(name, parentName, parentAddress) {
	const isSofePlugin = /.+!sofe.*/;
	name = name.match(isSofePlugin) ? normalizeSofePlugin(name) : name;

	// If the module is loaded by a parent referencing !sofe, treat it is as a sofe service
	if (parentName && parentName.match(/sofe(@[0-9a-zA-Z\-\.]+)?\.js$/)) {
		if (name.match(isSofePlugin)) {
			return systemNormalize.call(this, name, parentName, parentAddress);
		} else {
			if (name && name[0] === '.') {
				// Only load files relative to the sofe service
				// if they are loaded with a relative path
				return resolvePathFromService(serviceMap, name, parentName);
			} else {
				// Else treat the dependency like a normal file
				// to be loaded relative to the application code
				return systemNormalize.call(this, name, parentName, parentAddress);
			}
		}
	} else {
		return systemNormalize.call(this, name, parentName, parentAddress);
	}

	function normalizeSofePlugin(name) {
		return name.slice(0, name.indexOf('!')) + `!sofe`;
	}
}

export function isOverride(service) {
	return service ? serviceOverrides.indexOf(service) > -1 : !!serviceOverrides.length;
}

/**
 * Override SystemJS loader locate method
 * @param {Object} load Load object from System.js loader
 *        See more at: https://github.com/ModuleLoader/es6-module-loader/blob/v0.17.0/docs/loader-extensions.md
 *
 * @return {Promise} A promise which resolves with the service url
 */
export function locate(load) {
	const isSofePlugin = /.+!sofe.*/;

	middlewareId++;
	let id = middlewareId;

	return new Promise((resolvePromise, reject) => {
		stepMiddleware(allMiddleware, load, function(load, newMiddleware) {
			function resolve(url) {
				stepMiddleware(newMiddleware, url, function(newUrl, newMiddleware) {
					middlewareMap[id] = newMiddleware;
					middlewareTracker = id;
					resolvePromise(newUrl);
				});
			}

			let service = getServiceName(load.address);

			//first check session storage (since it is very transient)
			if (hasWindow && window.sessionStorage && window.sessionStorage.getItem(`sofe:${service}`)) {
				console.log(`Using session storage override to resolve sofe service '${service}' to url '${window.sessionStorage.getItem(`sofe:${service}`)}'`);
				console.log(`Run window.sessionStorage.removeItem('sofe:${service}') to remove this override`);
				const url = window.sessionStorage.getItem(`sofe:${service}`);
				serviceMap[load.name] = url;
				addServiceOverride(service);
				resolve(url);
			}
			//otherwise check local storage (since it is less transient)
			else if (hasWindow && window.localStorage && window.localStorage.getItem(`sofe:${service}`)) {
				console.log(`Using local storage override to resolve sofe service '${service}' to url '${window.localStorage.getItem(`sofe:${service}`)}'`);
				console.log(`Run window.localStorage.removeItem('sofe:${service}') to remove this override`);
				const url = window.localStorage.getItem(`sofe:${service}`);
				serviceMap[load.name] = url;
				addServiceOverride(service);
				resolve(url);
			}
			//otherwise check manifest
			else {
				getManifest(config)
				.then((manifest) => {
					// First try and resolve the service with the manifest,
					// otherwise resolve by requesting the registry
					if (manifest && manifest[service]) {
						serviceMap[load.name] = manifest[service];
						resolve(manifest[service]);
					} else {
						getUrlFromRegistry(service, config)
						.then((url) => {
							serviceMap[load.name] = url;
							resolve(url);
						})
						.catch((error) => {
							reject(error);
						});
					}
				})
				.catch((error) => {
					reject(error);
				});
			}
		});
	})
}

export function setMiddleWare(middleware) {
	allMiddleware = middleware;
}

export function fetch(load, systemFetch) {
	return new Promise((resolve, reject) => {
		const middleware = middlewareMap[middlewareTracker] || [];
		delete middlewareMap[middlewareTracker];
		let systemFetchAlreadyCalled = false;

		stepMiddleware(middleware, {
			systemFetch: function(load) {
				systemFetchAlreadyCalled = true;
				return systemFetch(load);
			},
			load
		}, (load) => {
			load = load.load ? load.load : load;

			if (systemFetchAlreadyCalled) {
				resolve(load);
			} else {
				resolve(systemFetch(load));
			}
		});
	});
}

function addServiceOverride(service) {
	if (serviceOverrides.indexOf(service) === -1) {
		serviceOverrides.push(service);
	}
}

if (typeof window !== 'undefined') {
	window.sofe = {
		clearCache: function() {
			serviceMap = {};
			allMiddleware = [];
			middlewareMap = {};
			serviceOverrides = [];
			clearManifest();
		}
	}
}
