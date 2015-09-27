/// <reference path="typings/open/open.d.ts" />
/// <reference path="typings/node/node.d.ts" />
/// <reference path="typings/express/express.d.ts" />
/// <reference path="typings/request/request.d.ts" />

import open = require("open");
import express = require("express");
import request = require("request");
import querystring = require("querystring");
import util = require("util");
import deezerTrack = require("DeezerTrack");

export class DeezerClient {
    private perms = "basic_access,email,manage_library";

    private redirectUrl = "http://localhost:5000/deezer-auth";
    private portNumber = 5000;

    private authUrl = "https://connect.deezer.com/oauth/auth.php?app_id=%s&redirect_uri=%s&perms=%s";
    private tokenUrl = "https://connect.deezer.com/oauth/access_token.php?app_id=%s&secret=%s&code=%s";
    private createPlaylistUrl = "http://api.deezer.com/user/me/playlists?access_token=%s&title=%s";
    private playlistUrl = "http://api.deezer.com/playlist/%s/tracks?access_token=%s&songs=%s";
    private playlistOpenUrl = "http://www.deezer.com/playlist/%s";
    private searchUrl = "http://api.deezer.com/search?q=artist:\"%s\" track:\"%s\"";

    private appSecret: string;
    private appId: string;
    private accessToken: string;

    constructor(appId: string, appSecret: string, accessToken?: string) {
        this.appSecret = appSecret;
        this.appId = appId;

        // accessToken is optional and can be set for testing purpose
        this.accessToken = accessToken;
    }

    login = (callback: Function) => {
        if (this.accessToken) {
            callback();
            return;
        }

        // setup an express web server because during auth, we need to have a redirect url
        // in this case, it will be on localhost :-)
        var app = express();

        app.get("/deezer-auth", (req, res) => {
            if (req.query.code) {
                res.send("Deezer authentication OK, you can close this window");
                const url = util.format(this.tokenUrl, this.appId, this.appSecret, req.query.code);
                request.get(url, (error, response, body) => {
                    var content = querystring.parse(body);
                    this.accessToken = content.access_token;
                    callback();
                });
            } else {
                res.send("Deezer authentication KO");
                callback();
            }
        });

        app.listen(this.portNumber, () => {
        });

        const url = util.format(this.authUrl, this.appId, this.redirectUrl, this.perms);
        open(url);
    }

    createPlaylist = (playlistName: string, callback: Function) => {
        const url = util.format(this.createPlaylistUrl, this.accessToken, playlistName);
        request.post(url, { method: "POST" }, (error, response, body) => {
            if (!error && response.statusCode === 200 && body) {
                callback(JSON.parse(body).id);
            } else {
                callback(null);
            }
        });
    }

    search = (track: deezerTrack.DeezerTrack, callback: Function) => {
        console.log("Searching for artist: " + track.artist + " title: " + track.title);
        const url = util.format(this.searchUrl, track.artist, track.title);
        request.get(url, (error, response, body) => {
            var result = JSON.parse(body);
            if (result.total > 0 && result.data) {
                // for now, we use only the first item as result - that could be improved
                track.track = result.data[0];
                console.log("  -> Found !");
            } else {
                console.log("  -> No match");
            }
            callback();
        });
    }

    addTrackToPlaylist = (tracks: deezerTrack.DeezerTrack[], playlistId: string) => {
        var ids = "";
        for (var i = 0; i < tracks.length; i++) {
            if (tracks[i].track) {
                ids += tracks[i].track.id + ",";
            }
        }
        const url = util.format(this.playlistUrl, playlistId, this.accessToken, ids);
        request.post(url, { method: "POST" }, (error, response, body) => {
            open(util.format(this.playlistOpenUrl, playlistId));
        });
    }
}
