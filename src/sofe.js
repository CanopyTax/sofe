
import { normalize, locate, fetch, isOverride } from './hooks.js';
import { getAllManifests as _getAllManifests } from './manifest.js';
System.normalize = normalize;

export function getAllManifests() {
	return _getAllManifests(System.sofe || {});
}

export { locate, fetch, isOverride };
