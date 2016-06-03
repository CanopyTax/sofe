describe('middleware', function() {
	let system, middleware;

	beforeEach(function(run) {
		system = new System.constructor();
		system.import('/base/src/middleware.js')
			.then((_middleware) => {
				middleware = _middleware;
				run();
			})
			.catch(fail);
	});

	it('should noop middleware', function(run) {
		middleware.stepMiddleware([], 'load', (load, newMiddleware) => {
			expect(load).toBe('load');
			expect(newMiddleware).toEqual([]);
			run();
		});
	});

	it('should execute one middleware', function(run) {
		middleware.stepMiddleware([function(load, next) {
			expect(load).toBe('load');
			next('load2');
		}], 'load', (load, newMiddleware) => {
			expect(load).toBe('load2');
			expect(newMiddleware).toEqual([undefined]);
			run();
		});
	});

	it('should chain for one middleware', function(run) {
		middleware.stepMiddleware([function(load, next) {
			expect(load).toBe('load');
			next('load2');
			return (load, next) => {
				next('load3');
			}
		}], 'load', (load, newMiddleware) => {
			expect(load).toBe('load2');
			middleware.stepMiddleware(newMiddleware, load, function(load, newMiddleware) {
				expect(load).toBe('load3');
				run();
			});
		});
	});

	it('should execute multiple middlewares', function(run) {
		middleware.stepMiddleware([
			function(load, next) {
				expect(load).toBe('load');
				next('load2');
			},
			function(load, next) {
				expect(load).toBe('load2');
				next('load3');
			}
		], 'load', (load, newMiddleware) => {
			expect(load).toBe('load3');
			expect(newMiddleware).toEqual([undefined, undefined]);
			run();
		});
	});

	it('should chain for multiple middlewares', function(run) {
		middleware.stepMiddleware([
			function(load, next) {
				expect(load).toBe('load');
				next('load2');

				return (load, next) => {
					expect(load).toBe('load4');
					next('load5');
				}
			},
			function(load, next) {
				expect(load).toBe('load2');
				next('load3');

				return (load, next) => {
					expect(load).toBe('load5');
					next('load6');
				}
			}
		], 'load', (load, newMiddleware) => {
			expect(load).toBe('load3');
			middleware.stepMiddleware(newMiddleware, 'load4', (load, newMiddleware) => {
				expect(load).toBe('load6');
				expect(newMiddleware).toEqual([undefined, undefined]);
				run();
			});
		});
	});

	it('should chain for multiple middlewares', function(run) {
		middleware.stepMiddleware([
			function(load, next) {
				expect(load).toBe('load');
				next('load2');

				return (load, next) => {
					expect(load).toBe('load4');
					next('load5');
				}
			},
			function(load, next) {
				expect(load).toBe('load2');
				next('load3');

				return (load, next) => {
					expect(load).toBe('load5');
					next('load6');
				}
			}
		], 'load', (load, newMiddleware) => {
			expect(load).toBe('load3');
			middleware.stepMiddleware(newMiddleware, 'load4', (load, newMiddleware) => {
				expect(load).toBe('load6');
				expect(newMiddleware).toEqual([undefined, undefined]);
				run();
			});
		});
	});

	it('should chain for many middlewares', function(run) {
		middleware.stepMiddleware([
			function(load, next) {
				expect(load).toBe('load');
				next('load2');

				return (load, next) => {
					expect(load).toBe('load5');
					next('load6');
				}
			},
			function(load, next) {
				expect(load).toBe('load2');
				next('load3');

				return (load, next) => {
					expect(load).toBe('load6');
					next('load7');
				}
			},
			function(load, next) {
				expect(load).toBe('load3');
				next('load4');

				return (load, next) => {
					expect(load).toBe('load7');
					next('load8');
				}
			}
		], 'load', (load, newMiddleware) => {
			expect(load).toBe('load4');
			middleware.stepMiddleware(newMiddleware, 'load5', (load, newMiddleware) => {
				expect(load).toBe('load8');
				expect(newMiddleware).toEqual([undefined, undefined, undefined]);
				run();
			});
		});
	});

	it('should skip undefined chained middleware', function(run) {
		middleware.stepMiddleware([function(load, next) {
			expect(load).toBe('load');
			next('load2');
		}], 'load', (load, newMiddleware) => {
			expect(load).toBe('load2');
			middleware.stepMiddleware(newMiddleware, load, function(load, newMiddleware) {
				expect(load).toBe('load2');
				run();
			});
		});
	});

	it('should skip multiple undefined chained middleware', function(run) {

		middleware.stepMiddleware([
			function(load, next) {
				expect(load).toBe('load');
				next('load2');
			},
			function(load, next) {
				expect(load).toBe('load2');
				next('load3');

				return (load, next) => {
					expect(load).toBe('load4');
					next('load5');
				}
			}
		], 'load', (load, newMiddleware) => {
			expect(load).toBe('load3');
			middleware.stepMiddleware(newMiddleware, 'load4', (load, newMiddleware) => {
				expect(load).toBe('load5');
				expect(newMiddleware).toEqual([undefined, undefined]);
				run();
			});
		});

	});

	it('should skip multiple undefined chained middleware reverse', function(run) {

		middleware.stepMiddleware([
			function(load, next) {
				expect(load).toBe('load');
				next('load2');

				return (load, next) => {
					expect(load).toBe('load4');
					next('load5');
				}
			},
			function(load, next) {
				expect(load).toBe('load2');
				next('load3');
			}
		], 'load', (load, newMiddleware) => {
			expect(load).toBe('load3');
			middleware.stepMiddleware(newMiddleware, 'load4', (load, newMiddleware) => {
				expect(load).toBe('load5');
				expect(newMiddleware).toEqual([undefined, undefined]);
				run();
			});
		});

	it('should skip undefined for many middlewares', function(run) {
		middleware.stepMiddleware([
			function(load, next) {
				expect(load).toBe('load');
				next('load2');

				return (load, next) => {
					expect(load).toBe('load5');
					next('load6');
				}
			},
			function(load, next) {
				expect(load).toBe('load2');
				next('load3');
			},
			function(load, next) {
				expect(load).toBe('load3');
				next('load4');

				return (load, next) => {
					expect(load).toBe('load6');
					next('load7');
				}
			}
		], 'load', (load, newMiddleware) => {
			expect(load).toBe('load4');
			middleware.stepMiddleware(newMiddleware, 'load5', (load, newMiddleware) => {
				expect(load).toBe('load7');
				expect(newMiddleware).toEqual([undefined, undefined, undefined]);
				run();
			});
		});
	});

	});

});
