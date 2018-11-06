function TestHook(SyncedFile,Q)   {
SyncedFile = SyncedFile || require('./SyncedFile.js');
Q = Q || require('q');
var echo = function (echo) {
    return echo;
};

return function SyncedFileCollection(config) {

    var map = {};
    var actions = [];
    
    var translateS3KeyToLocalPath = config.translateS3KeyToLocalPath || echo;
    var translateFilePathToS3Key = config.translateFilePathToS3Key || echo;

    function get(path, remotePath){
        var obj = map[path];
        if(!obj){
            obj = map[path] = new SyncedFile(path, remotePath, config);
            actions.push(obj.action);
            if(isGlobDone){
                obj.globDone();
            }
            if(isRemoteDone){
                obj.remoteDone();
            }
        }
        return obj;
    }

    function foundFile(path){
        if(isGlobDone) throw new Error('Glob is supposed to be done');
        var remotePath = translateFilePathToS3Key(path);
        get(path, remotePath).foundFile();
    }

    function foundRemote(remotePath,hash){
        if(isRemoteDone) throw new Error('Remote is supposed to be done');
        var localPath = translateS3KeyToLocalPath(remotePath);
        get(localPath, remotePath).foundRemote(hash);
    }

    var isGlobDone = false;
    var isRemoteDone = false;
    var scansDone = Q.defer();

    function globDone(){
        if(isGlobDone) throw new Error('globDone already called');
        isGlobDone = true;
        for(var i in map){
            if(map.hasOwnProperty(i)){
                map[i].globDone();
            }
        }
        if(isRemoteDone) scansDone.resolve();
    }

    function remoteDone(){
        if(isRemoteDone) throw new Error('remoteDone already called');
        isRemoteDone = true;
        for(var i in map){
            if(map.hasOwnProperty(i)){
                map[i].remoteDone();
            }
        }
        if(isGlobDone) scansDone.resolve();
    }


    this.foundFile = foundFile;
    this.foundRemote = foundRemote;
    this.globDone = globDone;
    this.remoteDone = remoteDone;

    this.allDone = scansDone.promise.then(function(){
        return Q.all(actions);
    });

};
}

var SyncedFileCollection = TestHook();
SyncedFileCollection.TestHook = TestHook;

module.exports = SyncedFileCollection;
