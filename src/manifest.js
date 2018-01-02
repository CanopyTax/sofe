let cachedRemoteManifestPromise = {};
let cachedManifests = {};
const hasWindow = typeof window !== 'undefined';

/**
 * Asynchronously find a manifest for resolving sofe services. The manifest is a simple
 * map where key values represent unique services and the values represent a URL
 * to load the service. If there is no available manifest, sofe will default to
 * querying npm for service resolution.
 *
 * @param {Object} config the sofe configuration object
 * @param {Array} visitedManifestUrls keep track of previously visited urls to detect circular dependencies
 * @param {String} parent if this is a recursively loaded manifest, who was the parent that loaded it?
 * @return {Promise} A promise which is resolved with a service manifest.
 */
export function getManifest(config, visitedManifestUrls = [], parent = null) {
  // Don't fetch the manifest twice
  if (config.manifestUrl && cachedRemoteManifestPromise[config.manifestUrl]) {
    return cachedRemoteManifestPromise[config.manifestUrl];
  }

  const promise = new Promise((resolve, reject) => {
    let staticManifest = config.manifest || {};

    if (config.manifestUrl && hasWindow) {
      const xhr = new XMLHttpRequest();
      xhr.addEventListener('load', xhrLoaded);
      xhr.addEventListener('error', xhrFailed);
      xhr.open('GET', config.manifestUrl);
      xhr.send();

      function xhrLoaded() {
        if (Number(xhr.status) >= 200 && Number(xhr.status) < 300) {
          let json;
          try {
            json = JSON.parse(xhr.responseText);
          } catch(ex) {
            xhrFailed();
            return;
          }

          visitedManifestUrls.push(config.manifestUrl);

          if (json && json.sofe) {

            // Record manifest tree information
            if (parent) {
              cachedManifests[config.manifestUrl] = {
                manifest: json.sofe.manifest || {},
                parent
              };

              if (!cachedManifests[parent]) {
                cachedManifests[parent] = {
                  manifest: staticManifest,
                  parent: 'static'
                };
              }
            } else {
              cachedManifests.static = {
                manifest: staticManifest,
                parent: null
              };

              if (!cachedManifests[config.manifestUrl]) {
                cachedManifests[config.manifestUrl] = {
                  manifest: json.sofe.manifest || {},
                  parent: 'static'
                }
              };
            }

            // First check if this manifest points to another manifest
            if (typeof json.sofe.manifestUrl === 'string') {
              if (visitedManifestUrls.indexOf(json.sofe.manifestUrl) >= 0) {
                reject(
                  new Error(`Cannot load manifest -- circular chain of sofe manifests, '${json.sofe.manifestUrl}' detected twice in chain.`)
                )
              } else {
                getManifest(json.sofe, visitedManifestUrls, config.manifestUrl)
                .then(chainedManifest => {
                  if (config.manifest === Object(config.manifest)) {
                    resolve({
                      ...chainedManifest,
                      ...config.manifest
                    });
                  } else {
                    resolve(chainedManifest);
                  }
                })
                .catch(err => {reject(err)});
              }
            }
            // Otherwise make sure this manifest actually is a manifest
            else if (json.sofe.manifest) {
              /* Ensure that the manifest is an object, without lodash. See
               * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
               * and http://stackoverflow.com/questions/8511281/check-if-a-variable-is-an-object-in-javascript
              */
              if (json.sofe.manifest === Object(json.sofe.manifest)) {

                const cachedRemoteManifest = {
                  ...json.sofe.manifest, ...staticManifest
                };

                if (hasWindow) {
                  window.sofe.cachedRemoteManifest = cachedRemoteManifest;
                }

                resolve(cachedRemoteManifest);
              } else {
                reject(
                  new Error(`Invalid manifest JSON at '${config.manifestUrl}': the 'manifest' property must be a plain object`)
                )
              }
            } else {
              reject(
                new Error(`Invalid manifest JSON at '${config.manifestUrl}': there must either be a 'sofe.manifest' object or 'sofe.manifestUrl' string`)
              )
            }
          } else {
            reject(
              new Error(`Invalid manifest JSON at '${config.manifestUrl}': a manifest must include a sofe attribute`)
            );
          }
        } else {
          xhrFailed();
        }
      }

      function xhrFailed() {
        reject(
          new Error('Invalid manifest: must be parseable JSON')
        );
      }
    } else {
      // Resolve with no manifest if there is no config.manifest or config.manifestUrl
      resolve(staticManifest);
    }
  });

  if (config.manifestUrl) {
    cachedRemoteManifestPromise[config.manifestUrl] = promise;
  }

  return promise;
}

export function getAllManifests(config) {
  return new Promise((resolve, reject) => {
    getManifest(config)
      .then((manifest) => {
        resolve({
          flat: { ...manifest },
          all: { ...cachedManifests }
        });
      })
      .catch(reject);;
  });
}

export function clearManifest() {
  cachedRemoteManifestPromise = window.sofe.cachedRemoteManifest = {};
  cachedManifests = {};
}
