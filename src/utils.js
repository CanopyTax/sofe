import { join } from 'path-browserify';

/**
 * Given a full URL address, parse the pathname
 *
 * @param {String} address A URL
 * @return {String} The path within the given URL
 */
export function getServiceName(address) {
	const splits = address.split('/');

	return splits[splits.length - 1];
}

/**
 * Try and resolve a file URL from a service. This allows a service to load a dependency
 * that is a relative path on its hosted location.
 *
 * @param {Object} services A map of identified and registered services
 * @param {String} name The name of the service that we are resolving
 * @param {String} parentName The parent which should be a sofe service with a resolved
 *                 path within the services argument.
 *
 * @return {String} The correct URL to load the given file name.
 */
export function resolvePathFromService(services, name, parentName) {

	let parentAddress = getServiceResolution(services, parentName);

	let urlParts = (/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/g).exec(parentAddress);

	return urlParts[1] + urlParts[3] + join(
		urlParts[5], '../', name
	);
}

function getServiceResolution(services, name) {
	for (let service in services) {
		if (name.indexOf(service) === 0) {
			return services[service];
		}
	}
}
