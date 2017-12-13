const hasWindow = typeof window !== 'undefined';

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

	const windowPath = hasWindow
		? window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1)
		: '';

	// The service name might have a path in it!
	// For example, you might `import a from 'service/a/path.js!sofe';`
	// In that case, we want `getServiceName` to return just `'sesrvice'`;
	let urlParts = getRegex().exec(address);
	const servicePath = urlParts[5];

	const splits = servicePath.substring(windowPath.length).split('/');

	// There might be a leading `/`, if so `splits[0]` is empty and
	// we want to get the second element of the array.
	return removeBang(splits[0] || splits[1]);
}

function removeBang(url) {
	return url.indexOf('!') > -1 ? url.substring(0, url.indexOf('!')) : url;
}

function getRegex() {
	return /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/g;
}
