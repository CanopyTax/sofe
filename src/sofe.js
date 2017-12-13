import { normalize, locate, fetch, getServiceUrl } from "./hooks.js";
import { isOverride, setMiddleWare, InvalidServiceName } from "./hooks.js";
import { getAllManifests as _getAllManifests } from "./manifest.js";
import { getManifest as _getManifest } from "./manifest.js";

export function getAllManifests() {
	return _getAllManifests(System.sofe || {});
}

export function applyMiddleware(...middleware) {
	let chain = middleware.map(middleware => middleware());
	setMiddleWare(chain);
}

export { locate, fetch, isOverride, getServiceUrl, InvalidServiceName };

export { getServiceName } from "./utils.js";

export function getManifest(url) {
	if (typeof url !== "string") {
		throw new Error(`sofe getManifest API must be called with a url string`);
	}

	// Ensure that the manifest for this url has been retrieved
	return _getManifest({ manifestUrl: url })
		.then(() => {
			/* We don't want the merged combination of all of the chained manifests,
			 * which is what _getManifest returns. Instead, we want *just* the manifest
			 * exactly as it is found at the specified url.
			 */
			return getAllManifests()
				.then(manifests => manifests.all[url].manifest);
		})
}

if (
	typeof localStorage !== "undefined" &&
	!localStorage.getItem("disable-sofe-override-warning")
) {
	let numOverrides = 0;
	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		const serviceName = key.slice("sofe:".length);

		if (key.match(/sofe:(\S)+/g)) {
			console.info(
				`There is a local storage sofe override for the service '${serviceName}' to url '${localStorage.getItem(key)}'`
			);
			numOverrides++;
		}
	}
	if (numOverrides > 0) {
		console.info(
			`Run localStorage.setItem('disable-sofe-override-warning', true) to turn off sofe override warnings`
		);
	}
}

if (
	typeof sessionStorage !== "undefined" &&
	!sessionStorage.getItem("disable-sofe-override-warning")
) {
	let numOverrides = 0;
	for (let i = 0; i < sessionStorage.length; i++) {
		const key = sessionStorage.key(i);
		const serviceName = key.slice("sofe:".length);

		if (key.match(/sofe:(\S)+/g)) {
			console.info(
				`There is a session storage sofe override for the service '${serviceName}' to url '${sessionStorage.getItem(key)}'`
			);
			numOverrides++;
		}
	}
	if (numOverrides > 0) {
		console.info(
			`Run sessionStorage.setItem('disable-sofe-override-warning', true) to turn off sofe override warnings`
		);
	}
}
