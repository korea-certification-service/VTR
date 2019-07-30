let request = require('request');
let config = require('../model/config');

function callVtr(body, callback) {
    let url = config.APIServer + "/v2/vtrs/" + body.itemId + "/step/" + body.stepValue;
    let header = {
        'token': config.APIToken
    };
    let country = config.country;
    let reqs = {uri: url, 
        method:'POST',
        headers: header
    }

    if(body.reqValue != undefined) {
        reqs['body'] = body.reqValue
        reqs['json'] = true;
    }

    //채팅 서버에서 API 서버로 내부 call요청한다.
    request(reqs, function (error, response, body) {  
        //console.log(error, response, body);
        if (!error && response.statusCode == 200) {
            let result = body.data;
            if(typeof(body) == "string") {
                result = JSON.parse(body).data;
            }
            callback(result);
        } else {
            callback(body);
        }
    });
}

exports.callVtr = callVtr;