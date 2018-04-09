# TootNowPlaying
iTunesやSpotifyで再生している音楽をmastodonで共有

## 動作イメージ
[![TootNowPlaying](http://img.youtube.com/vi/2dkjM8LNft8/0.jpg)](http://www.youtube.com/watch?v=2dkjM8LNft8)

## 使い方
SpotifyのClient IDとClient Secretを入手し、`.env`というファイルに以下のような形式で記入してください。
```
SPOTIFY_CLIENT_ID = cc94f5898836bbd9992a92706d6d5c75
SPOTIFY_CLIENT_SECRET = 5c0d90ae2c2127bc424908986a1f057d
```

以下のコマンドで実行できます。

```
npm install
electron .
```

## その他
`electron-json-storage`でSpotifyのアクセストークンやインスタンスのURIを保存しているので、何かおかしくなったら` C:\Users\<ユーザー名>\AppData\Roaming\TootNowPlaying`とか`/Users/<ユーザー名>/Library/Application Support/TootNowPlaying`とかにあるファイルを消してください。

## TODO
- [x] インスタンスの切り替え
- [x] Spotifyからログアウト
- [ ] コードをいい感じにする
- [ ] 配布のためにSpotifyのクライアントキー等を秘匿する？
