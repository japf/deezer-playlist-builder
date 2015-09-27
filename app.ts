/// <reference path="typings/minimist/minimist.d.ts" />
/// <reference path="DeezerTrack.ts" />
/// <reference path="DeezerClient.ts" />

import readline = require("readline");
import fs = require("fs");
import minimist = require("minimist");

import deezerTrack = require("./DeezerTrack");
import deezerClient = require("./DeezerClient");

// register your app on Deezer Developers portal
// https://developers.deezer.com/myapps
var appId = "";
var appSecret = "";

var argv = <any>minimist(process.argv.slice(2));
if (!argv.inputFile) {
    console.log("Missing argument -inputFile path");
    process.exit(-1);
}
if (!argv.playlistName) {
    console.log("Missing argument -playlistName");
    process.exit(-1);
}

var tracks: deezerTrack.DeezerTrack[] = [];

var deezer = new deezerClient.DeezerClient(appId, appSecret);

deezer.login(() => {
    deezer.createPlaylist(argv.playlistName, (playlistId) => {
        importFileToPlaylist(playlistId);
    });    
});

function importFileToPlaylist(playlistId: string) {
    // open the file given as parameter and read it line by line
    var rl = readline.createInterface(<any>{ input: fs.createReadStream(argv.inputFile) });
    rl.on('line', line => { tracks.push(new deezerTrack.DeezerTrack(line)); });

    // when we read end of file, search for all tracks
    rl.on('close', () => {
        console.log("Ready to search " + tracks.length + " track(s)");
        var i = 0;
        function searchTrack() {
            var track = tracks[i];
            deezer.search(track, () => {
                i++;
                if (i < tracks.length) {
                    // recursive call to look for next track
                    searchTrack();
                } else {
                    deezer.addTrackToPlaylist(tracks, playlistId);
                }
            });
        }
        searchTrack();
    });
}