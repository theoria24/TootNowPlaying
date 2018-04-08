const {ipcRenderer, shell} = require('electron')
const playback = require('playback');
const storage = require('electron-json-storage');
const base64 = require('base-64');

storage.get('config', function (error, data) {
    if (error) throw error;
    if (Object.keys(data).length === 0) {
      instance = null
      spotify_token = null
      spotify_refresh = null
    } else {
      instance = data.instance
      spotify_token = data.spotify_token
      spotify_refresh = data.spotify_refresh
    }
})

function getitunes() {
  playback.currentTrack((res) => {
    if (!res) {
      var nowplaying = "音楽が再生されていません"
    } else {
      var nowplaying = `${res.name} - ${res.artist} （${res.album}）`
    }
    $('#nowplaying').text(nowplaying)
  })
}

$(document).ready(function(){
  if (!instance) {
    $("#instance").removeClass("hide")
    $("#main").addClass("hide")
  }
  $('#instsub').on('click', function() {
    instance = $('#instance-uri').val()
    $("#instance").addClass("hide")
    $("#main").removeClass("hide")
    storage.set('config', {instance: $('#instance-uri').val(), spotify_token: spotify_token, spotify_refresh: spotify_refresh}, function (error) {
      if (error) throw error
    })
  })

  getitunes()

  $('#sync').on('click', function() {
    getitunes()
  })
  $('#toot').on('click', function() {
    shell.openExternal("https://" + instance + "/share?text=%23nowplaying+" + encodeURIComponent($('#nowplaying').text()))
  })
  $('#spotify').on('click', function() {
    if (!spotify_token) {
      ipcRenderer.send('spotify', 'auth')
    } else {
      ipcRenderer.send('spotify', spotify_token)
    }
  })
  ipcRenderer.on('spotify-reply', function (event, arg) {
    $('#nowplaying').text(arg)
  })
  ipcRenderer.on('spotify-auth', function (event, arg) {
    shell.openExternal(arg)
    $("#code").removeClass("hide")
  })
  ipcRenderer.on('spotify-access_token', function (event, arg) {
    console.log('spotify-access_token: ',arg)
    spotify_token = arg
    storage.set('config', {instance: instance, spotify_token: spotify_token, spotify_refresh: spotify_refresh}, function (error) {
      if (error) throw error
    })
  })
  ipcRenderer.on('spotify-refresh_token', function (event, arg) {
    console.log('spotify-refresh_token: ', arg)
    spotify_refresh = arg
    storage.set('config', {instance: instance, spotify_token: spotify_token, spotify_refresh: spotify_refresh}, function (error) {
      if (error) throw error
    })
  })
  ipcRenderer.on('spotify-refresh', function (event, arg) {
    console.log(arg)
    ipcRenderer.send('spotify-refresh', spotify_refresh)
  })
  $('#codesub').on('click', function() {
    ipcRenderer.send('spotify-code', $('#auth-code').val())
    $("#code").addClass("hide")
  })
})
