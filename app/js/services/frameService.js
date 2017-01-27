/*
    In questo file viene definito un oggetto FRAME
    ogni oggetto frame contiene le determinate variabili:
        numeroBlocco;
        tag;
        contenuto;
    
    Inoltre, il blocco contiene una funzione chiamata:
        isPieno -> se il numeroBlocco è vuoto ritorna false, altrimenti true.
*/

function Frame() {
    this.blockNumber = null;
    this.tag = null;
    this.content = null;
    this.lastAccess = null;
    this.fifoindex = null;
    this.lruindex = null;
}

Frame.prototype.isFull = function () {
    if (this.blockNumber === null) {
        return false;
    }
    return true;
};


