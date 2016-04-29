function TestHook(GlobRunner,RemoteRunner,SyncedFileCollection,S3PromiseWrapper,AWS,fileUtils,CloudFrontPromiseWrapper){
GlobRunner = GlobRunner || require('./GlobRunner.js');
RemoteRunner = RemoteRunner || require('./RemoteRunner.js');
SyncedFileCollection = SyncedFileCollection || require('./SyncedFileCollection.js');
S3PromiseWrapper = S3PromiseWrapper || require('./S3PromiseWrapper.js');
CloudFrontPromiseWrapper = CloudFrontPromiseWrapper || require('./CloudFrontPromiseWrapper.js');
fileUtils = fileUtils || require('./file-utils.js');
AWS = AWS || require('aws-sdk');
var S3 = AWS.S3;
var CloudFront = AWS.CloudFront;

return function ConfigRunner(){
    var config;

    this.setConfig = function(conf){
        config = conf;
        return this;
    };

    this.run = function(){

        if (typeof(config.credentials) === 'string') {
            AWS.config.loadFromPath(config.credentials);   
        }
        else if (typeof(config.credentials) === 'object') {
            AWS.config.update(config.credentials);
        }

        var s3 = new S3();
        var s3Wrapper = new S3PromiseWrapper(s3);

        var cloudFront = new CloudFront();
        var cloudFrontWrapper = new CloudFrontPromiseWrapper(cloudFront);

        var collection = new SyncedFileCollection(config.translateFilePathToS3Key, config.translateS3KeyToLocalPath);
        var globRunner = new GlobRunner(collection);
        var remoteRunner = new RemoteRunner(config.bucketName,collection,s3Wrapper);

        var patterns = config.patterns;

        for(var i = 0; i < patterns.length; i ++){
            globRunner.addPattern(patterns[i]);
        }

        //   config.patterns.forEach(globRunner.addPattern);

        remoteRunner.run();
        globRunner.run();

        collection.allDone.then(function(actions){
            var deletes = [];
            var invalidations = [];
            actions.forEach(function(obj){
                switch(obj.action){
                    case 'delete':

                        deletes.push(obj.remotePath);
                        invalidations.push(obj.remotePath);
                        break;
                    case 'upload':
                        invalidations.push(obj.remotePath);
                        fileUtils.getContents(obj.path).then(function(contents){
                            console.log('uploading: ' + obj.remotePath);
                            s3Wrapper.putObject(config.bucketName,obj.remotePath,contents).then(function(){
                            },function(reason){
                                console.log('error uploading: ' + obj.remotePath + ': ' + reason);
                            });
                        })
                        .catch(function(err){
                            throw err;
                        });


                }
            });
            if(deletes.length !== 0) {
                console.log('deleting the following: ');
                deletes.forEach(function(path){console.log('\t' + path)});
                s3Wrapper.deleteObjects(config.bucketName,deletes).then(
                    function(){console.log('delete successful')},
                    function(reason){console.log('delete failed ' + reason); console.log(reason); });
            }
            if(invalidations.length !== 0 && config.cloudFrontDistributionID) {
                console.log('invalidating the following on cloudfront %s: ', config.cloudFrontDistributionID);
                invalidations.forEach(function(path){console.log('\t' + path)});
                cloudFrontWrapper.doCreateInvalidation(config.cloudFrontDistributionID, invalidations).then(
                    function(){console.log('invalidations started')},
                    function(reason){console.log('invalidations failed ' + reason); console.log(reason); });
            }
        });

    };
};
}

var ConfigRunner = TestHook();
ConfigRunner.TestHook = TestHook;

module.exports = ConfigRunner;