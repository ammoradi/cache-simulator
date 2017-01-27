
function CacheFAssociative(frameNumber) {
    Cache.apply(this, [frameNumber]); //SUPER manufacturer, calls the constructor of the cache and passes parameters.
}

CacheFAssociative.prototype = Object.create(Cache.prototype); //It made sure that the prototype is something that comes from the cache prototype

CacheFAssociative.prototype.blockMark = function (blockNumber) {
    for (var i = 0; i < this.capacity; i++) {
        this.frames[i].blockNumber = blockNumber;
    }
};

CacheFAssociative.prototype.originFrame = function (frameNumber, ramBlockNumber) {
    var possibleIndex = [];
    for (var i = 0; i < ramBlockNumber; i++) {
        possibleIndex.push(i);
    }
    return possibleIndex;
};

CacheFAssociative.prototype.cancelRANDOM = function () {
    var index = Math.floor((Math.random() * this.capacity) + 0); //index = random number between 0 and capacity
    return index;
};

CacheFAssociative.prototype.cancelFIFO = function () {

    /*
         Each frame has the fifoIndex field.
         When an addition fifoIndex capacity = +1.
         So to take the added element for first I need seek the frame with minimum fifoIndex
    */
    var min = 0;
    for (var i = 0; i < this.capacity; i++) {
        if (this.frames[i].fifoindex < this.frames[min].fifoindex) {
            min = i;
        }
    }
    return min;

};

CacheFAssociative.prototype.recalculateLRU = function (index) {
    this.frames[index].lruindex = 0;
    for (var i = 0; i < this.placedBlock; i++) {
        this.frames[i].lruindex += 1;
    }
};

CacheFAssociative.prototype.cancelLRU = function () {

    /*
        Each frame has the lruindex field.
        lru index every time I call the function positioning block:
        sect me to the first item that I added now or I've used recently
        makes a +1 the index of all the other elements
       
        I just take the item that has lruindex higher.
    */
    var max = 0;
    for (var i = 0; i < this.capacity; i++) {
        if (this.frames[i].lruindex > this.frames[max].lruindex) max = i;
    }
    return max;

};

CacheFAssociative.prototype.blockPosition = function (blockNumber, xtag, lastAccess, algorithm) {
    var added = false;
    var found = false;
    //1. It runs all the blocks from the entered time and see if there is already in the cache block
    for (var i = 0; i < this.placedBlock; i++) {
        if (this.frames[i].tag === xtag) {
            found = true;
            this.frames[i].lastAccess = lastAccess;
            this.recalculateLRU(i);
            this.lastOperationIndex = i;
        }
    }

    if (found === true) {
        return 0;
    }

    //2. Il blocco non è presente tra quelli inseriti
    //--> Controlla se tutti i posti sono occupati, se no aggiunge un nuovo blocco
    //--> Se tutti i posti sono occupati allora chiama la cancellazione e poi aggiunge
    if (this.placedBlock < this.capacity) {
        this.frames[this.placedBlock].blockNumber = blockNumber;
        this.frames[this.placedBlock].tag = xtag;
        this.frames[this.placedBlock].fifoindex = this.placedBlock + 1;
        this.frames[this.placedBlock].lastAccess = lastAccess;
        var n = this.placedBlock;
        this.placedBlock += 1;
        this.recalculateLRU(n);
        this.lastOperationIndex = n;
    } else {
        var free;
        if (algorithm == "LRU") {
            free = this.cancelLRU();
        }
        if (algorithm == "Random") {
            free = this.cancelRANDOM();
        }
        if (algorithm == "FIFO") {
            free = this.cancelFIFO();
        }

        //Abbiamo ora ottenuta una porzione libera:
        //posizioniamo il nuovo blocco
        this.frames[free].blockNumber = blockNumber;
        this.frames[free].tag = xtag;
        this.frames[free].fifoindex = this.placedBlock + 1;
        this.frames[free].lastAccess = lastAccess;
        this.recalculateLRU(free);
        this.lastOperationIndex = free;
    }

    return 1;

};