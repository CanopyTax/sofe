export function stepMiddleware(middleware, load, action) {
	if (middleware.length === 0) return action(load, []);

	// If there are any undefined middleware, replace them with a noop
	middleware = middleware.map(f => f ? f : (load, next) => { next(load) });

	if (middleware.length === 1) {
		let next = middleware[0](load, (load) => {
			// neet to skip the current frame in case the next
			// middleware is immediately called.
			setTimeout(() => action(load, [next]));
		});
		return;
	}

	// keep track of the next middleware state
	let newMiddleware = [];

	const last = function(...args) {
		let next = middleware[middleware.length - 1](...args, (load) => {
			// neet to skip the current frame in case the next
			// middleware is immediately called.
			setTimeout(() => action(load, [ ...newMiddleware, next ]));
		})
	};

	const rest = middleware.slice(0, -1);

	const chain = rest.map((f, index) => {
			return (...args) => {
				if (index !== rest.length - 1) {
					let next = f(...args, (load) => setTimeout(() => chain[index + 1](load)));
					newMiddleware.push(next);
				} else {
					let next = f(...args, last);
					newMiddleware.push(next);
				}
			}
		});

	chain[0](load);
}
