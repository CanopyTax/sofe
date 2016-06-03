
import { normalize, locate, fetch, isOverride } from './hooks.js';
import { getAllManifests as _getAllManifests } from './manifest.js';
import { setMiddleWare } from './middleware.js';

System.normalize = normalize;

export function getAllManifests() {
	return _getAllManifests(System.sofe || {});
}

export function applyMiddleware(...middleware) {
	let chain = middleware.map(middleware => middleware());
	setMiddleWare(middleware);
}

export { locate, fetch, isOverride };
