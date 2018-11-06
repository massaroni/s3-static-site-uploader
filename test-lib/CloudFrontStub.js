function CloudFrontStub(){
    var thisStub = this;
    [
        'createInvalidation'
    ].forEach(function(fn){thisStub[fn] = sinon.stub();});
}

var cloudFrontStubSpy = sinon.spy(CloudFrontStub);

cloudFrontStubSpy.instance = function(index){
    return cloudFrontStubSpy.thisValues[index];
};

module.exports = cloudFrontStubSpy;