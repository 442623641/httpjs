# http.js

A lightweight AJAX request implementation of promises.
Because AJAX requests are the root of much asynchrony in Javascript.
\$http  provides the following functions which is similar to the angular $http

```js
$http.get(url, data, headers)
$http.post(url, data, headers)
$http.put(url, data, headers)
$http.delele(url, data, headers)
$http.request({/*config*/})
$http.promise()
```
`url`  : url string.

`data` *(optional)* : a{key: value} object or url-encoded string.

`headers` *(optional)* :   {key: value} object (e.g. `{"Accept":"application/json"}`).

**Example**:
```js
/*
get
*/
$http.get(url)
.success(function(response){
    ///todo
    ///...
    console.log('get success:'+response);
})
.error(function(response){
    ///todo
    ///...
    console.log('get error:'+response);
})
.finally(function(){
    ///todo
    ///...
    console.log('get finally');
})

/*
post
*/
$http.post(url)
.then(function(response){
    ///success
    ///todo
    ///...
    console.log('post success:'+response);
},function(response){
    ///fail
    ///todo
    ///...
    console.log('post error:'+response);
}).catch(function(e){
    console.log('catch exception:'+e);
})
```

You can set a time in milliseconds after which unresponsive $http
requests should be aborted. This is a global configuration option,
disabled by default.

    /* Global configuration option */
    promise.ajaxTimeout = 10000;


Have fun!
