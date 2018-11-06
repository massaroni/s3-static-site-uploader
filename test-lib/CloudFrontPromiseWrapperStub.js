function CloudFrontPromiseWrapperStub(){
    var thisStub = this;
    [
        'doCreateInvalidation'
    ].forEach(function(fn){
            thisStub[fn] = sinon.spy(function (){
                var defer = require('q').defer();
                defer.promise._defer = defer;
                return defer.promise;
            });
        }
    );
}

var cloudFrontSpy = sinon.spy(CloudFrontPromiseWrapperStub);

cloudFrontSpy.instance = function(index){
    return cloudFrontSpy.thisValues[index];
};

module.exports = cloudFrontSpy;
