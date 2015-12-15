import { join } from 'path-browserify';

/**
 * Given a full URL address, parse the pathname
 *
 * @param {String} address A URL
 * @return {String} The path within the given URL
 */
export function getServiceName(address) {
	let a = document.createElement('a');
	a.href = address;
	let service = a.pathname;

	if (service[0] === '/') service = service.substring(1);
	return service;
}

export function resolvePath(services, name, parentName) {

	let parentAddress = getServiceResolution(services, parentName);

	let a = document.createElement('a');
	a.href = parentAddress;

	return a.origin + join(
		a.pathname, '../', name
	);
}

function getServiceResolution(services, name) {
	for (let service in services) {
		if (name.indexOf(service) === 0) {
			return services[service];
		}
	}
}
