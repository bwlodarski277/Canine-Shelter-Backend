!(function (e, t) {
	typeof exports === 'object' && typeof module === 'object'
		? (module.exports = t())
		: typeof define === 'function' && define.amd
		? define('Fuse', [], t)
		: typeof exports === 'object'
		? (exports.Fuse = t())
		: (e.Fuse = t());
})(this, () => {
	return (
		(n = {}),
		(o.m = r = [
			function (e, t) {
				e.exports = function (e) {
					return Array.isArray
						? Array.isArray(e)
						: Object.prototype.toString.call(e) ===
								'[object Array]';
				};
			},
			function (e, t, r) {
				function l(e) {
					return (l =
						typeof Symbol === 'function' &&
						typeof Symbol.iterator === 'symbol'
							? function (e) {
									return typeof e;
							  }
							: function (e) {
									return e &&
										typeof Symbol === 'function' &&
										e.constructor === Symbol &&
										e !== Symbol.prototype
										? 'symbol'
										: typeof e;
							  })(e);
				}
				function n(e, t) {
					for (let r = 0; r < t.length; r++) {
						let n = t[r];
						(n.enumerable = n.enumerable || !1),
							(n.configurable = !0),
							'value' in n && (n.writable = !0),
							Object.defineProperty(e, n.key, n);
					}
				}
				let i = r(2),
					$ = r(8),
					E = r(0),
					o =
						(n(J.prototype, [
							{
								key: 'setCollection',
								value(e) {
									return (this.list = e);
								}
							},
							{
								key: 'search',
								value(e) {
									let t =
										arguments.length > 1 &&
										void 0 !== arguments[1]
											? arguments[1]
											: { limit: !1 };
									this._log(
										'---------\nSearch pattern: "'.concat(
											e,
											'"'
										)
									);
									let r = this._prepareSearchers(e),
										n = r.tokenSearchers,
										o = r.fullSearcher,
										i = this._search(n, o),
										a = i.weights,
										s = i.results;
									return (
										this._computeScore(a, s),
										this.options.shouldSort &&
											this._sort(s),
										t.limit &&
											typeof t.limit === 'number' &&
											(s = s.slice(0, t.limit)),
										this._format(s)
									);
								}
							},
							{
								key: '_prepareSearchers',
								value() {
									let e =
											arguments.length > 0 &&
											void 0 !== arguments[0]
												? arguments[0]
												: '',
										t = [];
									if (this.options.tokenize)
										for (
											let r = e.split(
													this.options.tokenSeparator
												),
												n = 0,
												o = r.length;
											n < o;
											n += 1
										)
											t.push(new i(r[n], this.options));
									return {
										tokenSearchers: t,
										fullSearcher: new i(e, this.options)
									};
								}
							},
							{
								key: '_search',
								value() {
									let e =
											arguments.length > 0 &&
											void 0 !== arguments[0]
												? arguments[0]
												: [],
										t =
											arguments.length > 1
												? arguments[1]
												: void 0,
										r = this.list,
										n = {},
										o = [];
									if (typeof r[0] === 'string') {
										for (
											let i = 0, a = r.length;
											i < a;
											i += 1
										)
											this._analyze(
												{
													key: '',
													value: r[i],
													record: i,
													index: i
												},
												{
													resultMap: n,
													results: o,
													tokenSearchers: e,
													fullSearcher: t
												}
											);
										return { weights: null, results: o };
									}
									for (
										var s = {}, c = 0, h = r.length;
										c < h;
										c += 1
									)
										for (
											let l = r[c],
												u = 0,
												f = this.options.keys.length;
											u < f;
											u += 1
										) {
											let d = this.options.keys[u];
											if (typeof d !== 'string') {
												if (
													((s[d.name] = {
														weight:
															1 - d.weight || 1
													}),
													d.weight <= 0 ||
														d.weight > 1)
												)
													throw new Error(
														'Key weight has to be > 0 and <= 1'
													);
												d = d.name;
											} else s[d] = { weight: 1 };
											this._analyze(
												{
													key: d,
													value: this.options.getFn(
														l,
														d
													),
													record: l,
													index: c
												},
												{
													resultMap: n,
													results: o,
													tokenSearchers: e,
													fullSearcher: t
												}
											);
										}
									return { weights: s, results: o };
								}
							},
							{
								key: '_analyze',
								value(e, t) {
									let r = e.key,
										n = e.arrayIndex,
										o = void 0 === n ? -1 : n,
										i = e.value,
										a = e.record,
										s = e.index,
										c = t.tokenSearchers,
										h = void 0 === c ? [] : c,
										l = t.fullSearcher,
										u = void 0 === l ? [] : l,
										f = t.resultMap,
										d = void 0 === f ? {} : f,
										v = t.results,
										p = void 0 === v ? [] : v;
									if (i != null) {
										let g = !1,
											y = -1,
											m = 0;
										if (typeof i === 'string') {
											this._log(
												'\nKey: '.concat(
													r === '' ? '-' : r
												)
											);
											let k = u.search(i);
											if (
												(this._log(
													'Full text: "'
														.concat(i, '", score: ')
														.concat(k.score)
												),
												this.options.tokenize)
											) {
												for (
													var S = i.split(
															this.options
																.tokenSeparator
														),
														x = [],
														b = 0;
													b < h.length;
													b += 1
												) {
													let M = h[b];
													this._log(
														'\nPattern: "'.concat(
															M.pattern,
															'"'
														)
													);
													for (
														var _ = !1, L = 0;
														L < S.length;
														L += 1
													) {
														let w = S[L],
															A = M.search(w),
															C = {};
														A.isMatch
															? ((C[w] = A.score),
															  (_ = g = !0),
															  x.push(A.score))
															: ((C[w] = 1),
															  this.options
																	.matchAllTokens ||
																	x.push(1)),
															this._log(
																'Token: "'
																	.concat(
																		w,
																		'", score: '
																	)
																	.concat(
																		C[w]
																	)
															);
													}
													_ && (m += 1);
												}
												y = x[0];
												for (
													var I = x.length, O = 1;
													O < I;
													O += 1
												)
													y += x[O];
												(y /= I),
													this._log(
														'Token score average:',
														y
													);
											}
											let j = k.score;
											y > -1 && (j = (j + y) / 2),
												this._log('Score average:', j);
											let P =
												!this.options.tokenize ||
												!this.options.matchAllTokens ||
												m >= h.length;
											if (
												(this._log(
													'\nCheck Matches: '.concat(
														P
													)
												),
												(g || k.isMatch) && P)
											) {
												let F = d[s];
												F
													? F.output.push({
															key: r,
															arrayIndex: o,
															value: i,
															score: j,
															matchedIndices:
																k.matchedIndices
													  })
													: ((d[s] = {
															item: a,
															output: [
																{
																	key: r,
																	arrayIndex: o,
																	value: i,
																	score: j,
																	matchedIndices:
																		k.matchedIndices
																}
															]
													  }),
													  p.push(d[s]));
											}
										} else if (E(i))
											for (
												let T = 0, z = i.length;
												T < z;
												T += 1
											)
												this._analyze(
													{
														key: r,
														arrayIndex: T,
														value: i[T],
														record: a,
														index: s
													},
													{
														resultMap: d,
														results: p,
														tokenSearchers: h,
														fullSearcher: u
													}
												);
									}
								}
							},
							{
								key: '_computeScore',
								value(e, t) {
									this._log('\n\nComputing score:\n');
									for (
										let r = 0, n = t.length;
										r < n;
										r += 1
									) {
										for (
											var o = t[r].output,
												i = o.length,
												a = 1,
												s = 1,
												c = 0;
											c < i;
											c += 1
										) {
											let h = e ? e[o[c].key].weight : 1,
												l =
													(h === 1
														? o[c].score
														: o[c].score || 0.001) *
													h;
											h !== 1
												? (s = Math.min(s, l))
												: (a *= o[c].nScore = l);
										}
										(t[r].score = s === 1 ? a : s),
											this._log(t[r]);
									}
								}
							},
							{
								key: '_sort',
								value(e) {
									this._log('\n\nSorting....'),
										e.sort(this.options.sortFn);
								}
							},
							{
								key: '_format',
								value(e) {
									let t = [];
									if (this.options.verbose) {
										let r = [];
										this._log(
											'\n\nOutput:\n\n',
											JSON.stringify(e, (e, t) => {
												if (
													l(t) === 'object' &&
													t !== null
												) {
													if (r.indexOf(t) !== -1)
														return;
													r.push(t);
												}
												return t;
											})
										),
											(r = null);
									}
									let n = [];
									this.options.includeMatches &&
										n.push((e, t) => {
											let r = e.output;
											t.matches = [];
											for (
												let n = 0, o = r.length;
												n < o;
												n += 1
											) {
												let i = r[n];
												if (
													i.matchedIndices.length !==
													0
												) {
													let a = {
														indices:
															i.matchedIndices,
														value: i.value
													};
													i.key && (a.key = i.key),
														i.hasOwnProperty(
															'arrayIndex'
														) &&
															i.arrayIndex > -1 &&
															(a.arrayIndex =
																i.arrayIndex),
														t.matches.push(a);
												}
											}
										}),
										this.options.includeScore &&
											n.push((e, t) => {
												t.score = e.score;
											});
									for (
										let o = 0, i = e.length;
										o < i;
										o += 1
									) {
										let a = e[o];
										if (
											(this.options.id &&
												(a.item = this.options.getFn(
													a.item,
													this.options.id
												)[0]),
											n.length)
										) {
											for (
												var s = { item: a.item },
													c = 0,
													h = n.length;
												c < h;
												c += 1
											)
												n[c](a, s);
											t.push(s);
										} else t.push(a.item);
									}
									return t;
								}
							},
							{
								key: '_log',
								value() {
									let e;
									this.options.verbose &&
										(e = console).log.apply(e, arguments);
								}
							}
						]),
						J);
				function J(e, t) {
					let r = t.location,
						n = void 0 === r ? 0 : r,
						o = t.distance,
						i = void 0 === o ? 100 : o,
						a = t.threshold,
						s = void 0 === a ? 0.6 : a,
						c = t.maxPatternLength,
						h = void 0 === c ? 32 : c,
						l = t.caseSensitive,
						u = void 0 !== l && l,
						f = t.tokenSeparator,
						d = void 0 === f ? / +/g : f,
						v = t.findAllMatches,
						p = void 0 !== v && v,
						g = t.minMatchCharLength,
						y = void 0 === g ? 1 : g,
						m = t.id,
						k = void 0 === m ? null : m,
						S = t.keys,
						x = void 0 === S ? [] : S,
						b = t.shouldSort,
						M = void 0 === b || b,
						_ = t.getFn,
						L = void 0 === _ ? $ : _,
						w = t.sortFn,
						A =
							void 0 === w
								? function (e, t) {
										return e.score - t.score;
								  }
								: w,
						C = t.tokenize,
						I = void 0 !== C && C,
						O = t.matchAllTokens,
						j = void 0 !== O && O,
						P = t.includeMatches,
						F = void 0 !== P && P,
						T = t.includeScore,
						z = void 0 !== T && T,
						E = t.verbose,
						K = void 0 !== E && E;
					!(function (e) {
						if (!(e instanceof J))
							throw new TypeError(
								'Cannot call a class as a function'
							);
					})(this),
						(this.options = {
							location: n,
							distance: i,
							threshold: s,
							maxPatternLength: h,
							isCaseSensitive: u,
							tokenSeparator: d,
							findAllMatches: p,
							minMatchCharLength: y,
							id: k,
							keys: x,
							includeMatches: F,
							includeScore: z,
							shouldSort: M,
							getFn: L,
							sortFn: A,
							verbose: K,
							tokenize: I,
							matchAllTokens: j
						}),
						this.setCollection(e);
				}
				e.exports = o;
			},
			function (e, t, r) {
				function n(e, t) {
					for (let r = 0; r < t.length; r++) {
						let n = t[r];
						(n.enumerable = n.enumerable || !1),
							(n.configurable = !0),
							'value' in n && (n.writable = !0),
							Object.defineProperty(e, n.key, n);
					}
				}
				let l = r(3),
					u = r(4),
					m = r(7),
					o =
						(n(k.prototype, [
							{
								key: 'search',
								value(e) {
									if (
										(this.options.isCaseSensitive ||
											(e = e.toLowerCase()),
										this.pattern === e)
									)
										return {
											isMatch: !0,
											score: 0,
											matchedIndices: [[0, e.length - 1]]
										};
									let t = this.options,
										r = t.maxPatternLength,
										n = t.tokenSeparator;
									if (this.pattern.length > r)
										return l(e, this.pattern, n);
									let o = this.options,
										i = o.location,
										a = o.distance,
										s = o.threshold,
										c = o.findAllMatches,
										h = o.minMatchCharLength;
									return u(
										e,
										this.pattern,
										this.patternAlphabet,
										{
											location: i,
											distance: a,
											threshold: s,
											findAllMatches: c,
											minMatchCharLength: h
										}
									);
								}
							}
						]),
						k);
				function k(e, t) {
					let r = t.location,
						n = void 0 === r ? 0 : r,
						o = t.distance,
						i = void 0 === o ? 100 : o,
						a = t.threshold,
						s = void 0 === a ? 0.6 : a,
						c = t.maxPatternLength,
						h = void 0 === c ? 32 : c,
						l = t.isCaseSensitive,
						u = void 0 !== l && l,
						f = t.tokenSeparator,
						d = void 0 === f ? / +/g : f,
						v = t.findAllMatches,
						p = void 0 !== v && v,
						g = t.minMatchCharLength,
						y = void 0 === g ? 1 : g;
					!(function (e) {
						if (!(e instanceof k))
							throw new TypeError(
								'Cannot call a class as a function'
							);
					})(this),
						(this.options = {
							location: n,
							distance: i,
							threshold: s,
							maxPatternLength: h,
							isCaseSensitive: u,
							tokenSeparator: d,
							findAllMatches: p,
							minMatchCharLength: y
						}),
						(this.pattern = this.options.isCaseSensitive
							? e
							: e.toLowerCase()),
						this.pattern.length <= h &&
							(this.patternAlphabet = m(this.pattern));
				}
				e.exports = o;
			},
			function (e, t) {
				let l = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;
				e.exports = function (e, t) {
					let r =
							arguments.length > 2 && void 0 !== arguments[2]
								? arguments[2]
								: / +/g,
						n = new RegExp(t.replace(l, '\\$&').replace(r, '|')),
						o = e.match(n),
						i = Boolean(o),
						a = [];
					if (i)
						for (let s = 0, c = o.length; s < c; s += 1) {
							let h = o[s];
							a.push([e.indexOf(h), h.length - 1]);
						}
					return {
						score: i ? 0.5 : 1,
						isMatch: i,
						matchedIndices: a
					};
				};
			},
			function (e, t, r) {
				let E = r(5),
					K = r(6);
				e.exports = function (e, t, r, n) {
					for (
						var o = n.location,
							i = void 0 === o ? 0 : o,
							a = n.distance,
							s = void 0 === a ? 100 : a,
							c = n.threshold,
							h = void 0 === c ? 0.6 : c,
							l = n.findAllMatches,
							u = void 0 !== l && l,
							f = n.minMatchCharLength,
							d = void 0 === f ? 1 : f,
							v = i,
							p = e.length,
							g = h,
							y = e.indexOf(t, v),
							m = t.length,
							k = [],
							S = 0;
						S < p;
						S += 1
					)
						k[S] = 0;
					if (y !== -1) {
						let x = E(t, {
							errors: 0,
							currentLocation: y,
							expectedLocation: v,
							distance: s
						});
						if (
							((g = Math.min(x, g)),
							(y = e.lastIndexOf(t, v + m)) !== -1)
						) {
							let b = E(t, {
								errors: 0,
								currentLocation: y,
								expectedLocation: v,
								distance: s
							});
							g = Math.min(b, g);
						}
					}
					y = -1;
					for (
						var M = [], _ = 1, L = m + p, w = 1 << (m - 1), A = 0;
						A < m;
						A += 1
					) {
						for (var C = 0, I = L; C < I; )
							E(t, {
								errors: A,
								currentLocation: v + I,
								expectedLocation: v,
								distance: s
							}) <= g
								? (C = I)
								: (L = I),
								(I = Math.floor((L - C) / 2 + C));
						L = I;
						let O = Math.max(1, v - I + 1),
							j = u ? p : Math.min(v + I, p) + m,
							P = Array(j + 2);
						P[j + 1] = (1 << A) - 1;
						for (let F = j; O <= F; F -= 1) {
							let T = F - 1,
								z = r[e.charAt(T)];
							if (
								(z && (k[T] = 1),
								(P[F] = ((P[F + 1] << 1) | 1) & z),
								A !== 0 &&
									(P[F] |=
										((M[F + 1] | M[F]) << 1) |
										1 |
										M[F + 1]),
								P[F] & w &&
									(_ = E(t, {
										errors: A,
										currentLocation: T,
										expectedLocation: v,
										distance: s
									})) <= g)
							) {
								if (((g = _), (y = T) <= v)) break;
								O = Math.max(1, 2 * v - y);
							}
						}
						if (
							E(t, {
								errors: A + 1,
								currentLocation: v,
								expectedLocation: v,
								distance: s
							}) > g
						)
							break;
						M = P;
					}
					return {
						isMatch: y >= 0,
						score: _ === 0 ? 0.001 : _,
						matchedIndices: K(k, d)
					};
				};
			},
			function (e, t) {
				e.exports = function (e, t) {
					let r = t.errors,
						n = void 0 === r ? 0 : r,
						o = t.currentLocation,
						i = void 0 === o ? 0 : o,
						a = t.expectedLocation,
						s = void 0 === a ? 0 : a,
						c = t.distance,
						h = void 0 === c ? 100 : c,
						l = n / e.length,
						u = Math.abs(s - i);
					return h ? l + u / h : u ? 1 : l;
				};
			},
			function (e, t) {
				e.exports = function () {
					for (
						var e =
								arguments.length > 0 && void 0 !== arguments[0]
									? arguments[0]
									: [],
							t =
								arguments.length > 1 && void 0 !== arguments[1]
									? arguments[1]
									: 1,
							r = [],
							n = -1,
							o = -1,
							i = 0,
							a = e.length;
						i < a;
						i += 1
					) {
						let s = e[i];
						s && n === -1
							? (n = i)
							: s ||
							  n === -1 ||
							  ((o = i - 1) - n + 1 >= t && r.push([n, o]),
							  (n = -1));
					}
					return e[i - 1] && t <= i - n && r.push([n, i - 1]), r;
				};
			},
			function (e, t) {
				e.exports = function (e) {
					for (var t = {}, r = e.length, n = 0; n < r; n += 1)
						t[e.charAt(n)] = 0;
					for (let o = 0; o < r; o += 1)
						t[e.charAt(o)] |= 1 << (r - o - 1);
					return t;
				};
			},
			function (e, t, r) {
				let l = r(0);
				e.exports = function (e, t) {
					return (function e(t, r, n) {
						if (r) {
							let o = r.indexOf('.'),
								i = r,
								a = null;
							o !== -1 &&
								((i = r.slice(0, o)), (a = r.slice(o + 1)));
							let s = t[i];
							if (s != null)
								if (
									a ||
									(typeof s !== 'string' &&
										typeof s !== 'number')
								)
									if (l(s))
										for (
											let c = 0, h = s.length;
											c < h;
											c += 1
										)
											e(s[c], a, n);
									else a && e(s, a, n);
								else n.push(s.toString());
						} else n.push(t);
						return n;
					})(e, t, []);
				};
			}
		]),
		(o.c = n),
		(o.d = function (e, t, r) {
			o.o(e, t) ||
				Object.defineProperty(e, t, { enumerable: !0, get: r });
		}),
		(o.r = function (e) {
			typeof Symbol !== 'undefined' &&
				Symbol.toStringTag &&
				Object.defineProperty(e, Symbol.toStringTag, {
					value: 'Module'
				}),
				Object.defineProperty(e, '__esModule', { value: !0 });
		}),
		(o.t = function (t, e) {
			if ((1 & e && (t = o(t)), 8 & e)) return t;
			if (4 & e && typeof t === 'object' && t && t.__esModule) return t;
			let r = Object.create(null);
			if (
				(o.r(r),
				Object.defineProperty(r, 'default', {
					enumerable: !0,
					value: t
				}),
				2 & e && typeof t !== 'string')
			)
				for (let n in t) o.d(r, n, (e => t[e]).bind(null, n));
			return r;
		}),
		(o.n = function (e) {
			let t =
				e && e.__esModule
					? function () {
							return e.default;
					  }
					: function () {
							return e;
					  };
			return o.d(t, 'a', t), t;
		}),
		(o.o = function (e, t) {
			return Object.prototype.hasOwnProperty.call(e, t);
		}),
		(o.p = ''),
		o((o.s = 1))
	);
	function o(e) {
		if (n[e]) return n[e].exports;
		let t = (n[e] = { i: e, l: !1, exports: {} });
		return r[e].call(t.exports, t, t.exports, o), (t.l = !0), t.exports;
	}
	let n, r;
});
