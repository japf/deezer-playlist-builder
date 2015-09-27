var DeezerTrack = (function () {
    function DeezerTrack(line) {
        this.separator = " - ";
        this.artist = line.split(this.separator)[0];
        this.title = line.split(this.separator)[1];
    }
    return DeezerTrack;
})();
exports.DeezerTrack = DeezerTrack;
//# sourceMappingURL=DeezerTrack.js.map