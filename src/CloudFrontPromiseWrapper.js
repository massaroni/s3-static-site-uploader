function TestHook(Q, paramBuilder){
    Q = Q || require('q');

    paramBuilder = paramBuilder || require('./CloudFrontParameterBuilder.js')



function CloudFrontPromiseWrapper(CloudFrontInstance){
    this._cloudFront = CloudFrontInstance;
}

CloudFrontPromiseWrapper.prototype.doCreateInvalidation = function(distributionID, paths){
    var _defer = Q.defer();
    this.createInvalidation(distributionID, paths).then(
        function(result){
            _defer.resolve('created');
        },
        function(reason){
            switch(reason.statusCode) {
                case 403:
                    _defer.resolve('forbidden');
                    break;
                default:
                    _defer.reject(reason);
            }
        }
    );
    return _defer.promise;
};

function addParameterFunction(functionName){
    CloudFrontPromiseWrapper.prototype[functionName] = function(){
        var params = paramBuilder[functionName].apply(this,arguments);
        return Q.ninvoke(this._cloudFront,functionName,params);
    }
}

for(var i in paramBuilder){
    if(paramBuilder.hasOwnProperty(i)){
        addParameterFunction(i);
    }
}
return CloudFrontPromiseWrapper;

}

var CloudFrontPromiseWrapper = TestHook();
CloudFrontPromiseWrapper.TestHook = TestHook;

module.exports = CloudFrontPromiseWrapper;
