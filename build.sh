#!/bin/sh

filename='mailhops'

rm -f $filename.zip

zip -r $filename.zip ./ -i '*.js' '*.xhtml' '*.html' '*.png' '*.svg' '*.gif' '*.css' '*.json' '*.dtd'
