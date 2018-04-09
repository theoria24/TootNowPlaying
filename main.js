'use strict';
const menubar = require('menubar')
const {ipcMain} = require('electron')
const SpotifyWebApi = require('spotify-web-api-node')
const base64 = require('base-64');
const request = require('request')
require('dotenv').config()

var spotify = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: "https://theoria24.github.io/callback/nowplaying-for-mastodon.html"
})

var enc = base64.encode(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`)
var headers = {
  'Authorization':`Basic ${enc}`
}

const mb = menubar()
mb.on('ready', function ready () {
  console.log('open window')
})

ipcMain.on('spotify', (event, arg) => {
  console.log(arg)
  if (arg == 'auth') {
    event.sender.send('spotify-auth', "https://accounts.spotify.com/authorize/?client_id=" + process.env.SPOTIFY_CLIENT_ID + "&response_type=code&redirect_uri=https%3A%2F%2Ftheoria24.github.io%2Fcallback%2Fnowplaying-for-mastodon.html&scope=user-read-currently-playing")
  } else {
    spotify.setAccessToken(arg)
    spotify.getMyCurrentPlayingTrack().then(function(data) {
      var artist = ""
      for(let i = 0; i < data.body.item.artists.length; i++) {
        if (i > 0) {
          var artist = artist + ", "
        }
        var artist = artist + data.body.item.artists[i].name
      }
      var nowplaying = `${data.body.item.name} - ${artist} （${data.body.item.album.name}） ${data.body.item.external_urls.spotify}`
      event.sender.send('spotify-reply', nowplaying)
    }, function(err) {
      console.log('Something went wrong!', err)
      event.sender.send('spotify-refresh', err)
    })
  }
})
ipcMain.on('spotify-code', (event, arg) => {
  var options = {
    url: 'https://accounts.spotify.com/api/token',
    method: 'POST',
    headers: headers,
    json: true,
    form: {"grant_type":"authorization_code","code":arg,"redirect_uri":"https://theoria24.github.io/callback/nowplaying-for-mastodon.html"}
  }
  request(options, function (error, response, body) {
    console.log(body)
    event.sender.send('spotify-access_token', body.access_token)
    event.sender.send('spotify-refresh_token', body.refresh_token)
  })
})
ipcMain.on('spotify-refresh', (event, arg) => {
  var options = {
    url: 'https://accounts.spotify.com/api/token',
    method: 'POST',
    headers: headers,
    json: true,
    form: {"grant_type":"refresh_token","refresh_token":arg,"redirect_uri":"https://theoria24.github.io/callback/nowplaying-for-mastodon.html"}
  }
  request(options, function (error, response, body) {
    console.log(body)
    event.sender.send('spotify-access_token', body.access_token)
    event.sender.send('spotify-refresh_token', body.refresh_token)
  })
})
