var AWS = require('aws-sdk');
var Q = require('Q');
var crypto = require('crypto');
var fs = require('fs');
var mime = require('mime');

Q.longStackSupport = true;

function md5(str){
    return crypto.createHash('md5').update(str).digest('hex');
}

function base64(str){
    return new Buffer(str).toString('base64');
}

function Constructor(){
    this._s3 = new AWS.S3();
}

Constructor.prototype = {
    md5:md5,
    base64:base64,
    loadCredentials:function(path){
        this._s3.config.loadFromPath(path);
    },
    createBucket:function(bucketName){
        var params = {
            Bucket: bucketName
        };
        return Q.ninvoke(this._s3,'createBucket', params);
    },
    /*
     *  exists and is readable - promise resolves
     *  does not exist - promise rejected with code 404 (NotFound)
     *  exists and is forbidden - 403(Forbidden)
     */
    headBucket:function(bucketName){
        var params = {
            Bucket:bucketName
        };
        return Q.ninvoke(this._s3,'headBucket',params);
    },
    putBucketPolicy:function(bucketName,policy){
        var policyString = JSON.stringify(policy);

        var params = {
            Bucket:bucketName,
            Policy:policyString
        };

        return Q.ninvoke(this._s3,'putBucketPolicy',params);
    },
    readFile: Q.denodeify(fs.readFile),
    putObject:function(bucketName, key, body,mimeType){
        mimeType = mimeType || mime.lookup(key);

       // console.log(body);
        var params = {
            Bucket:bucketName,
            Key: key,
            Body: body,//new Buffer(body),
            ContentType: mimeType

        };
        return Q.ninvoke(this._s3,'putObject',params);
    },
    putBucketWebsite:function(bucketName,index,error) {
        var params = {
            Bucket:bucketName,
            WebsiteConfiguration:{}
        };
        if(index){
            params.WebsiteConfiguration.IndexDocument = {
                Suffix:index
            };
        }
        if(error){
            params.WebsiteConfiguration.ErrorDocument = {
                Key:error
            };
        }

        return Q.ninvoke(this._s3,'putBucketWebsite',params);
    },

    listObjects:function(bucketName,prefix){
        var params = {
            Bucket:bucketName
        };
        if(prefix){
            params.Prefix = prefix;
        }

        return Q.ninvoke(this._s3,'listObjects',params);


    },

    createReadAllBucketPolicy:function(bucketName){
        return {
            "Version": "2008-10-17",
            "Statement": [
            {
                "Sid": "PublicReadForGetBucketObjects",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "*"
                },
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::" + bucketName + "/*"
            }
        ]
        };
    }


};

module.exports = Constructor;
