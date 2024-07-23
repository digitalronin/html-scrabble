# Online multiplayer Scrabble with HTML/JavaScript UI

This is a fork of https://github.com/hanshuebner/html-scrabble via
https://github.com/cfrerebeau/html-scrabble.

Please visit the original project for information about the project's history
and features.

The purpose of this fork is to enable easy hosting of this app. on fly.io

The main difference from the original is to enable storing game data in Redis,
rather than in the filesystem, as the original project does.

## Development

`make run` - launch a docker compose instance

Alternatively, run the node app. and a redis instance separately to get more control (e.g. hot code reloading)

## Deploying to fly.io

TBD

### Sending email invitations

TBD
