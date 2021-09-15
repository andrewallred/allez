# Allez
 
Allez is a Node tool to upload GoQuest games to OGS for AI analysis. GoQuest is the most active 9x9 Go community online, however the fast pace of games and the lack of review tools can at times be a hindrance to learning. Allez uploads your GoQuest games to OGS enabling you to use OGS's powerful AI analysis tools as well as its branching and version capabilities.

![Artful Goban](/goban.jpg)

## Where to find your games

Allez uploads your games to your user library on OGS. Your library can be found by clicking the hamburger menu in the top left corner and then selecting "SGF Library".

## Setup

Setup is a bit of a bear, but put simply Allez runs as a Node cron job every 3 minutes and is easily hostable in Heroku. Allez needs a few different pieces of information to access your GoQuest and OGS accounts. You can find the needed fields in the sample.env file.

```
GQ_PROFILE_NAME=
GQ_GAME_MESSAGE=
OGS_USER_ID=
OGS_CLIENT_ID=
OGS_CLIENT_SECRET=
OGS_USERNAME=
OGS_PASSWORD=
```

#### GQ_PROFILE_NAME
GQ_PROFILE_NAME is your profile name on GoQuest.

#### GQ_GAME_MESSAGE
GQ_GAME_MESSAGE is the websocket message the GoQuest client sends to load a specific game.

#### OGS_USER_ID
OGS_USER_ID is your user id on OGS.

#### OGS_CLIENT_ID & OGS_CLIENT_SECRET
To run Allez yourself, you will have to register a client application in OGS which you can do [here](https://online-go.com/oauth2/applications/). Once you have registered your application you will receive a client id and client secret. Your client type should be public and the authorization grant type should be "password".

#### OGS_USERNAME
OGS_USERNAME is your user name on OGS.

#### OGS_PASSWORD
To authorize the application you created above (see OGS_CLIENT_ID & OGS_CLIENT_SECRET) to access your account you'll have to add an OAUTH password in OGS. This is not your normal password and can only be used by authorized applications.

