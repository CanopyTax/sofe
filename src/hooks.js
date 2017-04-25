import { getServiceName } from "./utils.js";
import { getUrlFromRegistry } from "./registries.js";
import { getManifest, clearManifest } from "./manifest.js";
import { stepMiddleware } from "./middleware.js";

const config = SystemJS.sofe || {};

const hasWindow = typeof window !== "undefined";

let allMiddleware = [];
let serviceMap = {};
let serviceOverrides = [];
let middlewareMap = {};
let middlewareId = 0;
let middlewareTracker = 0;

export class InvalidServiceName extends Error {}

export function getServiceUrl(name) {
	if (!serviceMap[name]) {
		throw new InvalidServiceName(
			`Service "${name}" has not been loaded, import the service before getting the service URL`
		);
	}
	return serviceMap[name];
}

export function isOverride(service) {
	return service
		? serviceOverrides.indexOf(service) > -1
		: !!serviceOverrides.length;
}

/**
 * Override SystemJS loader locate method
 * @param {Object} load Load object from System.js loader
 *        See more at: https://github.com/ModuleLoader/es6-module-loader/blob/v0.17.0/docs/loader-extensions.md
 *
 * @return {Promise} A promise which resolves with the service url
 */
export function locate(load) {
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
			if (
				hasWindow &&
				window.sessionStorage &&
				window.sessionStorage.getItem(`sofe:${service}`)
			) {
				const url = window.sessionStorage.getItem(`sofe:${service}`);
				serviceMap[service] = url;
				addServiceOverride(service);
				resolve(url);
			} else if (
				hasWindow &&
				window.localStorage &&
				window.localStorage.getItem(`sofe:${service}`)
			) {
				//otherwise check local storage (since it is less transient)
				const url = window.localStorage.getItem(`sofe:${service}`);
				serviceMap[service] = url;
				addServiceOverride(service);
				resolve(url);
			} else {
				//otherwise check manifest
				getManifest(config)
					.then(manifest => {
						// First try and resolve the service with the manifest,
						// otherwise resolve by requesting the registry
						if (manifest && manifest[service]) {
							serviceMap[service] = manifest[service];
							resolve(manifest[service]);
						} else {
							getUrlFromRegistry(service, config)
								.then(url => {
									serviceMap[service] = url;
									resolve(url);
								})
								.catch(error => {
									reject(error);
								});
						}
					})
					.catch(error => {
						reject(error);
					});
			}
		});
	});
}

export function setMiddleWare(middleware) {
	allMiddleware = [...allMiddleware, ...middleware];
}

export function fetch(load, systemFetch) {
	return new Promise((resolve, reject) => {
		const middleware = middlewareMap[middlewareTracker] || [];
		delete middlewareMap[middlewareTracker];
		let systemFetchAlreadyCalled = false;

		stepMiddleware(
			middleware,
			{
				systemFetch: function(load) {
					systemFetchAlreadyCalled = true;
					return systemFetch(load);
				},
				load,
			},
			load => {
				load = load.load ? load.load : load;

				if (systemFetchAlreadyCalled) {
					resolve(load);
				} else {
					resolve(systemFetch(load));
				}
			}
		);
	});
}

function addServiceOverride(service) {
	if (serviceOverrides.indexOf(service) === -1) {
		serviceOverrides.push(service);
	}
}

if (typeof window !== "undefined") {
	window.sofe = {
		clearCache: function() {
			serviceMap = {};
			allMiddleware = [];
			middlewareMap = {};
			serviceOverrides = [];
			clearManifest();
		},
	};
}
