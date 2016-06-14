import $ from 'jquery';

function parsejqXHRHeaders(jqXHR) {
    const headers = jqXHR.getAllResponseHeaders().split('\r\n');

    let headersKVP = {};

    headers.forEach((header) => {
        const headerSplit = header.split(':');

        if (headerSplit[0] && headerSplit[1]) {
            let headerName = headerSplit[0];
            headerName = headerName.charAt(0).toLowerCase() + headerName.slice(1);
            headersKVP[headerName] = headerSplit[1].trim();
        }
    });

    return headersKVP;
}

function success(data, textStatus, jqXHR, callback) {
    const body = data;

    let response = {
        statusCode: jqXHR.status,
        headers: parsejqXHRHeaders(jqXHR)
    };

    if (callback) {
        //Callback has signature (error, response, body)
        callback(null, response, body);
    }
}

function error(jqXHR, textStatus, errorThrown, callback) {
    const error = jqXHR.statusText,
        response = {
            statusCode: jqXHR.status
        },
        body = jqXHR.responseText;

    if (callback) {
        //Callback has signature (error, response, body)
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
    },

    error: error,
    parsejqXHRHeaders: parsejqXHRHeaders,
    setupJQueryOpts: setupJQueryOpts,
    success: success
};
