#!/bin/sh

heroku container:push web -a csgo-market-api
heroku container:release web -a csgo-market-api