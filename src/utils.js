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

  const path = removeBang(address);

  return path.substring(path.lastIndexOf('/')+1);
}

function removeBang(url) {
  return url.indexOf('!') > -1 ? url.substring(0, url.indexOf('!')) : url;
}

function getRegex() {
  return /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/g;
}
