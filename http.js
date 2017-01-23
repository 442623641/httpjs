/*
 *  http v1.0.0 ~ (c) 2016-2020 LeoZhang 
 */
(function(exports) {
    var REJECTED=-1,PENDING=0,RESOLVED=1;
    function Promise(resolver) {
        if (! (this instanceof Promise)) return new Promise(resolver)

        var self = this; 
        self.callbacks = [] ;
        self.status = PENDING;

        function resolve(value) {
            if (value instanceof Promise) {
                return value.then(resolve, reject)
            }
            setTimeout(function() {
                if (self.status !== PENDING) {
                    return;
                }
                self.status = RESOLVED;
                self.data = value;

                for (var i = 0; i < self.callbacks.length; i++) {
                    self.callbacks[i].onResolved(value);
                }
            })
        }

        function reject(reason) {
            setTimeout(function() {
                if (self.status !== PENDING) {
                    return
                }
                self.status = REJECTED;
                self.data = reason;

                for (var i = 0; i < self.callbacks.length; i++) {
                    self.callbacks[i].onRejected(reason)
                }
            })
        }

        try {
            resolver(resolve, reject)
        } catch(e) {
            reject(e)
        }
    }

    function resolvePromise(promise, x, resolve, reject) {
        var then
        var thenCalledOrThrow = false

        if (promise === x) {
            return reject(new TypeError('Chaining cycle detected for promise!'))
        }

        if (x instanceof Promise) {
            if (x.status === PENDING) {
                x.then(function(v) {
                    resolvePromise(promise, v, resolve, reject);
                },
                reject);
            } else {
                x.then(resolve, reject)
            }
            return;
        }

        if ((x !== null) && ((typeof x === 'object') || (typeof x === 'function'))) {
            try {
                then = x.then
                if (typeof then === 'function') {
                    then.call(x,
                    function rs(y) {
                        if (thenCalledOrThrow) return thenCalledOrThrow = true;
                        return resolvePromise(promise, y, resolve, reject)
                    },
                    function rj(r) {
                        if (thenCalledOrThrow) return thenCalledOrThrow = true;
                        return reject(r);
                    })
                } else {
                    return resolve(x)
                }
            } catch(e) {
                if (thenCalledOrThrow) return thenCalledOrThrow = true;
                return reject(e);
            }
        } else {
            return resolve(x);
        }
    }

    Promise.prototype.then = function(onResolved, onRejected) {
        onResolved = typeof onResolved === 'function' ? onResolved: function(v) {
            return v;
        }
        onRejected = typeof onRejected === 'function' ? onRejected: function(r) {
            throw r;
        }
        var self = this;
        var promise2;

        if (self.status === RESOLVED) {
            return promise2 = new Promise(function(resolve, reject) {
                setTimeout(function() {
                    try {
                        var value = onResolved(self.data) ;
                        resolvePromise(promise2, value, resolve, reject);
                    } catch(e) {
                        return reject(e);
                    }
                })
            })
        }

        if (self.status === REJECTED) {
            return promise2 = new Promise(function(resolve, reject) {
                setTimeout(function() {
                    try {
                        var value = onRejected(self.data); 
                        resolvePromise(promise2, value, resolve, reject);
                    } catch(e) {
                        return reject(e);
                    }
                })
            })
        }

        if (self.status === PENDING) {
            return promise2 = new Promise(function(resolve, reject) {
                self.callbacks.push({
                    onResolved: function(value) {
                        try {
                            var value = onResolved(value);
                             resolvePromise(promise2, value, resolve, reject);
                        } catch(e) {
                            return reject(e);
                        }
                    },
                    onRejected: function(reason) {
                        try {
                            var value = onRejected(reason); 
                            resolvePromise(promise2, value, resolve, reject);
                        } catch(e) {
                            return reject(e);
                        }
                    }
                })
            })
        }
    }
    Promise.prototype.catch = function(onRejected) {
        return this.then(null, onRejected);
    }

    Promise.prototype.finally = function(fn) {
        return this.then(function(v) {
            setTimeout(fn); 
            return v;
        },
        function(r) {
            setTimeout(fn); 
            throw r;
        })
    }

    Promise.prototype.success = function(fn) {
        //assertArgFn(fn, 'fn');
        return this.then(fn);
    };
    Promise.prototype.error = function(fn) {
        //assertArgFn(fn, 'fn');
        return this.then(null,fn);
    };

    Promise.prototype.delay = function(duration) {
        return this.then(function(value) {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve(value);
                },
                duration);
            });
        },
        function(reason) {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    reject(reason)
                },
                duration);
            });
        });
    }

    Promise.resolve = function(value) {
        return new Promise(function(resolve) {
            resolve(value);
        });
    }

    Promise.reject = function(reason) {
        return new Promise(function(resolve, reject) {
            reject(reason);
        });
    }

    Promise.done = Promise.stop = function() {
        return new Promise(function() {});
    }

    Promise.deferred = Promise.defer = function() {
        var dfd = {};
        dfd.promise = new Promise(function(resolve, reject) {
            dfd.resolve = resolve; 
            dfd.reject = reject;
        });
        return dfd;
    }

    /*
     * AJAX requests
     */
    function _encode(data) {
        var payload = "";
        if (typeof data === "string") {
            payload = data;
        } else {
            var e = encodeURIComponent;
            var params = [];

            for (var k in data) {
                if (data.hasOwnProperty(k)) {
                    params.push(e(k) + '=' + e(data[k]));
                }
            }
            payload = params.join('&');
        }
        return payload;
    }

    function _createXhr() {
        var xhr;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch(e) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        }
        return xhr;
    }

    function _ajax(method, url, data, headers) {
        var p = Promise.deferred();
        var xhr, payload;
        data = data || {};
        headers = headers || {};

        try {
            xhr = _createXhr();
        } catch(e) {
            p.reject(e);
            return p;
        }

        payload = _encode(data);
        if (method === 'GET' && payload) {
            url += '?' + payload;
            payload = null;
        }

        xhr.open(method, url);

        var content_type = 'application/x-www-form-urlencoded';
        for (var h in headers) {
            if (headers.hasOwnProperty(h)) {
                if (h.toLowerCase() === 'content-type') content_type = headers[h];
                else xhr.setRequestHeader(h, headers[h]);
            }
        }
        xhr.setRequestHeader('Content-type', content_type);

        function onTimeout() {
            xhr.abort();
            p.reject($http.ETIMEOUT);
        }

        var timeout = $http.ajaxTimeout;
        if (timeout) {
            var tid = setTimeout(onTimeout, timeout);
        }

        xhr.onreadystatechange = function() {
            if (timeout) {
                clearTimeout(tid);
            }
            if (xhr.readyState === 4) {
                //var err = ;
                if (!xhr.status || (xhr.status < 200 || xhr.status >= 300) && xhr.status !== 304) p.reject(xhr.status);
                else p.resolve(xhr.responseText);
            }
        };

        xhr.send(payload);

        return p.promise;
    }

    function _ajaxer(method) {
        return function(url, data, headers) {
            return _ajax(method, url, data, headers);
        };
    }
    function request(options){
        // User defined options
        var _options={
            method:"GET",
            url:"",
            data:{},
            headers:""
        }
        for (i in options) _options[i] = options[i];
        return _ajax(_options.method, _options.url, _options.data, _options.headers);
    }
    var $http = {
        request:request,
        promise: Promise.deferred,
        get: _ajaxer('GET'),
        post: _ajaxer('POST'),
        put: _ajaxer('PUT'),
        delete: _ajaxer('DELETE'),
        /* Error codes */
        ENOXHR: 1,
        ETIMEOUT: 2,
        /**
         * Aborted requests resolve the promise with a ETIMEOUT error
         * code.
         */
        ajaxTimeout: 0
    };

    if (typeof module != 'undefined' && module.exports) {
        module.exports = $http;
    } else if (typeof define == 'function' && define.amd) {
        define(function() {
            return $http;
        });
    } else {
        exports.$http = $http;
    }

})(this);