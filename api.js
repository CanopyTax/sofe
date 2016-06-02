import { applyMiddleware, isOverride, getManifests } from 'sofe';

// All hooks
const canopyEnvsMiddleware = manifests => (preLocateLoad, preLocate) => {
  preLocate(preLocateLoad);
	return (postLocateLoad, postLocate) => {
		postLocate(postLocateLoad);
		return (fetchLoad, fetch) => {
			fetch(fetchLoad);
		}
	};
}

const otherMiddleware = manifests => (preLocateLoad, preLocate) => {
  preLocate(preLocateLoad);
}

const logMiddleWare = manifests => preLocateLoad => {
	console.log('preLocate');
	return postLocateLoad => {
		console.log('postLocate');
		return fetchLoad => {
			console.log('fetch');
		}
	};
}

applyMiddleware(canopyEnvsMiddleware, otherMiddleware, logMiddleWare)

getManifests().then((manifests) => {
	console.log(manifests);
});

isOverride() === true;
