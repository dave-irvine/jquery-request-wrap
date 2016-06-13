import $ from 'jquery';

function success(data, textStatus, jqXHR, callback) {
    //Callback has signature (error, response, body)
    const body = data,
        headers = jqXHR.getAllResponseHeaders().split('\r\n');

    let headersKVP = {};

    headers.forEach((header) => {
        let headerSplit = header.split(':');

        if (headerSplit[0] && headerSplit[1]) {
            let headerName = headerSplit[0];
            headerName = headerName.charAt(0).toLowerCase() + headerName.slice(1);
            headersKVP[headerName] = headerSplit[1].trim();
        }
    });

    let response = {
        statusCode: jqXHR.status,
        headers: headersKVP
    };

    if (callback) {
        callback(null, response, body);
    }
}

function error(jqXHR, textStatus, errorThrown, callback) {
    //Callback has signature (error, response, body)
    const error = jqXHR.statusText,
        response = {
            statusCode: jqXHR.status
        },
        body = jqXHR.responseText;

    if (callback) {
        callback(error, response, body);
    }
}
    
function setupJQueryOpts(opts, callback) {
    let jQueryOpts = {};

    if (opts.json) {
        jQueryOpts.dataType = 'json';
    }

    if (opts.headers) {
        jQueryOpts.headers = opts.headers;
    }

    jQueryOpts.success = (data, textStatus, jqXHR) => {
        success.apply(null, [data, textStatus, jqXHR, callback]);
    };

    jQueryOpts.error = (jqXHR, textStatus, errorThrown) => {
        error.apply(null, [jqXHR, textStatus, errorThrown, callback]);
    };

    return jQueryOpts;
}

//Wrap jQuery's ajax implementation to work like the Request node module.
export default {
    get: (opts, callback) => {
        let jQueryOpts = setupJQueryOpts(opts, callback);
    
        jQueryOpts.data = opts.body;
    
        $.ajax(opts.uri, jQueryOpts);
    },
    
    post: (opts, callback) => {
        let jQueryOpts = setupJQueryOpts(opts, callback);
    
        jQueryOpts.method = 'post';
        jQueryOpts.data = opts.body;
    
        $.ajax(opts.uri, jQueryOpts);
    },
    
    delete: (opts, callback) => {
        let jQueryOpts = setupJQueryOpts(opts, callback);
    
        jQueryOpts.method = 'delete';
    
        $.ajax(opts.uri, jQueryOpts);
    },
    
    patch: (opts, callback) => {
        let jQueryOpts = setupJQueryOpts(opts, callback);
    
        jQueryOpts.method = 'patch';
        jQueryOpts.data = opts.body;
    
        $.ajax(opts.uri, jQueryOpts);
    }
};
