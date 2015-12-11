/**
 * Given a full URL address, parse the pathname
 *
 * @param {String} address A URL
 * @return {String} The path within the given URL
 */
export function getServiceName(address) {
	var a = document.createElement('a');
	a.href = address;
	var service = a.pathname;
	if (service[0] === '/') service = service.substring(1);
	return service;
}
