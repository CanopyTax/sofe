import { normalize, locate, fetch, isOverride, setMiddleWare } from './hooks.js';
import { getManifest as _getManifest, getAllManifests as _getAllManifests } from './manifest.js';

System.normalize = normalize;

export function getAllManifests() {
	return _getAllManifests(System.sofe || {});
}

export function applyMiddleware(...middleware) {
	let chain = middleware.map(middleware => middleware());
	setMiddleWare(chain);
}

export { locate, fetch, isOverride };

export { getServiceName } from './utils.js';

export function getManifest(url) {
	if (typeof url !== 'string') {
		throw new Error(`sofe getManifest API must be called with a url string`);
	}

	return _getManifest({manifestUrl: url});
}
