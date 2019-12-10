#!/bin/sh

filename='mailhops'

rm -f $filename.zip

zip -r $filename.zip ./ -x ./images/* -i *.js *.xul *.png *.gif *.css *.json *.dtd _locales/*/messages.json *.manifest
