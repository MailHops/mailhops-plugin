#!/bin/sh

filename='mailhops'

rm -f $filename.xpi

mkdir build
mkdir build/chrome

cd chrome
zip -r $filename.jar . -i *.js *.xul *.png *.gif *.rdf *.css *.dtd
mv $filename.jar ../build/chrome/

cd ..
cp *.rdf build
cp *.manifest build
cd build
zip -r $filename.xpi . -i *.rdf *.manifest *.jar
mv $filename.xpi ../
cd ..
rm -rf build

