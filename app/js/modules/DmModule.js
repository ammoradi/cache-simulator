/*
      Class that defines the type of Direct cache.
      Direct Cache class is still a cache. So, it derives from the cache class.
      They are derived both variable and methods.
     
      They are also redefined the functions:
          -blockMark -> takes the clicked block number in RAM and make the corresponding frame
          -originFrame -> takes the selected frame rate and make the corresponding ram block
*/

function CacheDirect(frameNumber) {
    Cache.apply(this, [frameNumber]); //SUPER manufacturer, calls the constructor of the cache and passes parameters.
}

CacheDirect.prototype = Object.create(Cache.prototype); //It made sure that the prototype is something that comes from the cache prototype

CacheDirect.prototype.blockMark = function (blockNumber) {
    var blockPos = blockNumber % this.capacity;
    this.frames[blockPos].blockNumber = blockNumber;
};

CacheDirect.prototype.originFrame = function (frameNumber, ramBlockNumber) {
    var possibleIndex = [];
    for (var i = frameNumber; i < ramBlockNumber; i = i + this.capacity) {
        possibleIndex.push(i);
    }
    return possibleIndex;
};

CacheDirect.prototype.blockPosition = function (block, xtag, lastAccess, algorithm) {
    var blockPos = block % this.capacity;
    var toReplace = 1; // selfie
    if (this.frames[blockPos].isFull() === true) {
        if (this.frames[blockPos].tag === xtag) {
            toReplace = 0;
            this.frames[blockPos].lastAccess = lastAccess;
        } else {
            this.frames[blockPos].blockNumber = block;
            this.frames[blockPos].tag = xtag;
            this.frames[blockPos].lastAccess = lastAccess;
            this.placedBlock += 1;
        }
    } else {
        this.frames[blockPos].blockNumber = block;
        this.frames[blockPos].tag = xtag;
        this.frames[blockPos].lastAccess = lastAccess;
        this.placedBlock += 1;
    }
    this.lastOperationIndex = blockPos;
    return toReplace;
};