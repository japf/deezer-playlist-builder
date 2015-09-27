export class DeezerTrack {
    private separator = " - ";

    public artist: string;
    public title: string;
    public track: any;

    constructor(line: string) {
        this.artist = line.split(this.separator)[0];
        this.title = line.split(this.separator)[1];
    }
}
