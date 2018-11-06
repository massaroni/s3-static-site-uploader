var CloudFrontStub = require('./../test-lib/CloudFrontStub.js');
var CloudFrontPromiseWrapper = requireCov('../src/CloudFrontPromiseWrapper.js');
var Q = require('q');

describe('CloudFrontPromiseWrapper', function () {
    var cloudFront, wrapper;

    beforeEach(function(){
        cloudFront = new CloudFrontStub();
        wrapper = new CloudFrontPromiseWrapper(cloudFront);
        engine.patch(wrapper,'createInvalidation');
        engine.patch(wrapper,'doCreateInvalidation');
    });

    describe('createInvalidation', function () {
        it('succeeds',function(done){
            cloudFront.createInvalidation.callsArgWithAsync(1,null,null,{RequestId: '955C7251CF7337EE'});
            wrapper.doCreateInvalidation('my-distribution', ['path']).then.expect.result.to.equal('created').then.notify(done);
        });

        it('fails from access (http error 403) resolves to "forbidden"',function(done){
            cloudFront.createInvalidation.callsArgWithAsync(1,{statusCode: 403,code:'Forbidden',name:'Forbidden',retryable:false});
            wrapper.doCreateInvalidation('my-distribution', ['path']).then.expect.result.to.equal('forbidden').then.notify(done);
        });

        it('other http errors reject the promise',function(done){
            cloudFront.createInvalidation.callsArgWithAsync(1,
                {statusCode: 408, code:'RequestTimeout', name:'RequestTimeout',retryable:false}
            );
            wrapper.doCreateInvalidation('my-distribution', ['path']).then.expect.rejection.deep.equal(
                {statusCode: 408, code:'RequestTimeout', name:'RequestTimeout',retryable:false}
            ).then.notify(done);
        });
    });
});
