 /* global Frame */

function Cache(frameNumber) {
    this.capacity = frameNumber;
    this.placedBlock = 0;
    this.lastOperationIndex = -1;
    this.frames = [];
    for (var i = 0; i < frameNumber; i++) {
        this.frames.push(new Frame());
    }
}