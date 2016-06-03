import { normalize, locate, fetch, isOverride, setMiddleWare } from './hooks.js';
import { getAllManifests as _getAllManifests } from './manifest.js';

System.normalize = normalize;

export function getAllManifests() {
	return _getAllManifests(System.sofe || {});
}

export function applyMiddleware(...middleware) {
	let chain = middleware.map(middleware => middleware());
	setMiddleWare(chain);
}

export { locate, fetch, isOverride };
