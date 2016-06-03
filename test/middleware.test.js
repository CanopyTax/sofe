describe('middleware', function() {
	describe('unit', function() {
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

		it('should not require next to be called for one middleware', function(run) {
			middleware.stepMiddleware([function(load) {
				expect(load).toBe('load');
				return (load) => {
					expect(load).toBe('load');
				}
			}], 'load', (load, newMiddleware) => {
				expect(load).toBe('load');
				middleware.stepMiddleware(newMiddleware, load, function(load, newMiddleware) {
					expect(load).toBe('load');
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

		it('should not require next to be called for multiple middleware', function(run) {
			middleware.stepMiddleware([
				function(load) {
					expect(load).toBe('load');
					return (load) => {
						expect(load).toBe('load');
					}
				},
				function(load) {
					expect(load).toBe('load');
					return (load) => {
						expect(load).toBe('load');
					}
				}
			], 'load', (load, newMiddleware) => {
				expect(load).toBe('load');
				middleware.stepMiddleware(newMiddleware, load, (load, newMiddleware) => {
					expect(load).toBe('load');
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

		it('should not require next to be called for many middlewares', function(run) {
			middleware.stepMiddleware([
				function(load) {
					expect(load).toBe('load');

					return (load) => {
						expect(load).toBe('load');
					}
				},
				function(load) {
					expect(load).toBe('load');

					return (load) => {
						expect(load).toBe('load');
					}
				},
				function(load) {
					expect(load).toBe('load');

					return (load) => {
						expect(load).toBe('load');
					}
				}
			], 'load', (load, newMiddleware) => {
				expect(load).toBe('load');
				middleware.stepMiddleware(newMiddleware, load, (load, newMiddleware) => {
					expect(load).toBe('load');
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
		})

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

	describe('integrated', function() {
		let system;

		beforeEach(function() {
			system = new System.constructor();
		});

		afterEach(function() {
			window.sofe.clearCache();
		});

		it('should execute preLocate middleware', function(run) {
			system.config({
				sofe: {
					manifest: {
						simple: root + '/test/services/simple1.js'
					}
				}
			});

			system.import('/base/src/sofe.js')
				.then(function(sofe) {
					sofe.applyMiddleware(() => (preLocateLoad, preLocate) => {
						expect(preLocateLoad.name).toBe('http://localhost:9876/santa');
						preLocateLoad.name = preLocateLoad.name.replace('santa', 'simple');
						preLocateLoad.address = preLocateLoad.address.replace('santa', 'simple');
						preLocate(preLocateLoad);
					})

					system.import('santa!/base/src/sofe.js')
						.then((auth) => {
							expect(auth).toBeDefined();
							run();
						})
						.catch(fail);

				})
				.catch(fail);
		});

		it('should execute postLocate middleware', function(run) {
			system.config({
				sofe: {
					manifest: {
						simple: root + '/test/services/simple1.js',
						santa: 'the north pole'
					}
				}
			});

			system.import('/base/src/sofe.js')
				.then(function(sofe) {
					sofe.applyMiddleware(() => (preLocateLoad, preLocate) => {
						preLocate(preLocateLoad);

						return (postLocateLoad, postLocate) => {
							expect(postLocateLoad).toBe('the north pole');
							postLocate(root + '/test/services/simple1.js');
						}
					})

					system.import('santa!/base/src/sofe.js')
						.then((auth) => {
							expect(auth).toBeDefined();
							run();
						})
						.catch(fail);

				})
				.catch(fail);
		});

		it('should execute fetch middleware', function(run) {
			system.config({
				sofe: {
					manifest: {
						simple: root + '/test/services/simple1.js',
						santa: 'the north pole'
					}
				}
			});

			system.import('/base/src/sofe.js')
				.then(function(sofe) {
					sofe.applyMiddleware(() => (preLocateLoad, preLocate) => {
						preLocate(preLocateLoad);

						return (postLocateLoad, postLocate) => {
							postLocate(postLocateLoad);
							return (fetchLoad, fetchLocate) => {
								fetchLoad.address = root + '/test/services/simple1.js';
								fetchLocate(fetchLoad);
							}
						}
					})

					system.import('santa!/base/src/sofe.js')
						.then((auth) => {
							expect(auth).toBeDefined();
							run();
						})
						.catch(fail);

				})
				.catch(fail);
		});

		it('should execute properly async middleware', function(run) {
			system.config({
				sofe: {
					manifest: {
						simple: root + '/test/services/simple1.js',
						santa: 'the north pole',
						rudolph: 'shiney nose',
					}
				}
			});

			system.import('/base/src/sofe.js')
				.then(function(sofe) {
					sofe.applyMiddleware(() => (preLocateLoad, preLocate) => {
						if (preLocateLoad.name.indexOf('rudolph') > -1) {
							setTimeout(() => preLocate(preLocateLoad), 110);
						} else {
							preLocate(preLocateLoad);
						}

						return (postLocateLoad, postLocate) => {
							if (preLocateLoad.name.indexOf('north') > -1) {
								setTimeout(() => postLocate(postLocateLoad), 100);
							} else {
								postLocate(postLocateLoad);
							}

							return (fetchLoad, fetchLocate) => {
								if (fetchLoad.address.indexOf('north') > -1) {
									fetchLoad.address = root + '/test/services/simple1.js';
									fetchLocate(fetchLoad);
								} else {
									fetchLoad.address = root + '/test/services/simple2.js';
									setTimeout(() => fetchLocate(fetchLoad), 120);
								}
							}
						}
					})

					Promise.all([
						system.import('santa!/base/src/sofe.js'),
						system.import('rudolph!/base/src/sofe.js'),
					]).then((all) => {
						expect(all[0]()).toBe('mumtaz');
						expect(all[1]()).toBe('kwayis');
						run();
					})
					.catch(fail);

				})
				.catch(fail);
		});
	});
});
