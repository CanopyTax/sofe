import { join } from 'path-browserify';

/**
 * Given a full URL address, parse the pathname
 *
 * @param {String} address A URL
 * @return {String} The path within the given URL
 */
export function getServiceName(obj) {
	let address;
	if (typeof obj === 'string') {
		address = obj;
	} else if (typeof obj === 'object' && typeof obj.address === 'string') {
		address = obj.address;
	} else {
		throw new Error(`getServiceName must be called with a string url or with a SystemJS load object that has an address`);
	}

	// The service name might have a path in it!
	// For example, you might `import a from 'service/a/path.js!sofe';`
	// In that case, we want `getServiceName` to return just `'sesrvice'`;
	let urlParts = getRegex().exec(address);
	const splits = urlParts[5].split('/');

	// There might be a leading `/`, if so `splits[0]` is empty and
	// we want to get the second element of the array.
	return splits[0] || splits[1];
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

	let urlParts = getRegex().exec(parentAddress);

	return urlParts[1] + urlParts[3] + join(
		urlParts[5], '../', name
	);
}

/**
 * Given a resolved service url, generate a corresponding absolute path from the original service name.
 * This is needed to resolve relative paths within the service name.
 *
 * @param {String} service The full service name requested to sofe, may include a relative path
 * @param {String} url The resolved url of the service
 *
 * @return {String} A new url with. Possibly the same as the input url.
 */
export function getUrlFromService(service, url) {
	let parts = getRegex().exec(service)[5].split('/');

	// if there is a leading `/` then `parts[0]` will be empty
	// and we want to strip that out.
	parts = !parts[0] ? parts.slice(1) : parts;

	// Remove the first element in the path, which should be the service name
	// For example, you might `import a from 'service/a/path.js!sofe';`
	// In that case, we want to remove `service` from the path;
	const path = parts.slice(1).join('/');

	if (path) {
		return `${url.substring(0, url.lastIndexOf('/'))}/${path}`;
	} else {
		return url;
	}
}

function getServiceResolution(services, name) {
	for (let service in services) {
		if (name.indexOf(service) === 0) {
			return services[service];
		}
	}
}

function getRegex() {
	return /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/g;
}
