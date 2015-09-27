/// <reference path="typings/minimist/minimist.d.ts" />
/// <reference path="DeezerTrack.ts" />
/// <reference path="DeezerClient.ts" />
var readline = require("readline");
var fs = require("fs");
var minimist = require("minimist");
var deezerTrack = require("./DeezerTrack");
var deezerClient = require("./DeezerClient");
// register your app on Deezer Developers portal
// https://developers.deezer.com/myapps
var appId = "";
var appSecret = "";
var argv = minimist(process.argv.slice(2));
if (!argv.inputFile) {
    console.log("Missing argument -inputFile path");
    process.exit(-1);
}
if (!argv.playlistName) {
    console.log("Missing argument -playlistName");
    process.exit(-1);
}
var tracks = [];
var deezer = new deezerClient.DeezerClient(appId, appSecret);
deezer.login(function () {
    deezer.createPlaylist(argv.playlistName, function (playlistId) {
        importFileToPlaylist(playlistId);
    });
});
function importFileToPlaylist(playlistId) {
    // open the file given as parameter and read it line by line
    var rl = readline.createInterface({ input: fs.createReadStream(argv.inputFile) });
    rl.on('line', function (line) { tracks.push(new deezerTrack.DeezerTrack(line)); });
    // when we read end of file, search for all tracks
    rl.on('close', function () {
        console.log("Ready to search " + tracks.length + " track(s)");
        var i = 0;
        function searchTrack() {
            var track = tracks[i];
            deezer.search(track, function () {
                i++;
                if (i < tracks.length) {
                    // recursive call to look for next track
                    searchTrack();
                }
                else {
                    deezer.addTrackToPlaylist(tracks, playlistId);
                }
            });
        }
        searchTrack();
    });
}
//# sourceMappingURL=app.js.map