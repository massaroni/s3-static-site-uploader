var AWSStub = {
    config:{
        loadFromPath:sinon.spy(),
        update:sinon.spy()
    },
    S3:require('./S3Stub.js'),
    CloudFront:require('./CloudFrontStub.js'),
    reset:function(){
        AWSStub.config.loadFromPath.reset();
        AWSStub.config.update.reset();
        AWSStub.S3.reset();
        AWSStub.CloudFront.reset();
    }
};

module.exports=AWSStub;

