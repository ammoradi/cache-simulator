/* global Cache, CacheFAssociative */

CacheSAssociative.prototype = Object.create(Cache.prototype); //It made sure that the prototype is something that comes from the cache prototype

function CacheSAssociative(capacity, associativity) {
    Cache.apply(this, [capacity]); //SUPER manufacturer, calls the constructor of the cache and passes parameters.
    this.sets = [];

    this.numberSet = capacity / associativity;

    for (var i = 0; i < this.numberSet; i++) {
        this.sets.push(new CacheFAssociative(associativity));
    }
}

CacheSAssociative.prototype.blockMark = function (blockNumber) {
    var assignedSet = blockNumber % this.numberSet;
    var set = this.sets[assignedSet];
    set.blockMark(blockNumber);
};

CacheSAssociative.prototype.originFrame = function (nSet, ramBlockNumber) {
    var rootNumber = nSet;
    var possibleIndex = [];
    for (var i = rootNumber; i < ramBlockNumber; i = i + this.numberSet) {
        possibleIndex.push(i);
    }
    return possibleIndex;
};

CacheSAssociative.prototype.cancelsIndicatorsLastOperation = function () {
    for (var i = 0; i < this.numberSet; i++) {
        this.sets[i].lastOperationIndex = -1;
    }
};

CacheSAssociative.prototype.blockPosition = function (blockNumber, xtag, lastAccess, algorithm) {
    var setBlock = blockNumber % (this.numberSet);
    this.cancelsIndicatorsLastOperation();
    return this.sets[setBlock].blockPosition(blockNumber, xtag, lastAccess, algorithm);
};