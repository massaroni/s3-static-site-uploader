var util = require('util');

var createParams = {
    createInvalidation:function(distributionID, paths){
        var now = new Date();
        return {
            DistributionId: distributionID,
            InvalidationBatch: {
                CallerReference: util.format('s3-upload-%s%s%s-%s:%s',
                    now.getFullYear(),
                    ("0" + (now.getMonth() + 1)).slice(-2),
                    ("0" + now.getDate()).slice(-2),
                    ("0" + now.getHours()).slice(-2),
                    ("0" + now.getMinutes()).slice(-2)),
                Paths: {
                    Quantity: paths.length,
                    Items: paths
                }
            }
        };
    }
};

module.exports = createParams;
