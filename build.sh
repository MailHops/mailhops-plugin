#!/bin/sh

filename='mailhops'

rm -f $filename.xpi

find ./ -type f -name "._*" -exec rm {} \;

mkdir build
mkdir build/chrome

cd chrome
zip -r $filename.jar . -i *.js *.xul *.png *.gif *.rdf *.css *.dtd *.properties *.svg
mv $filename.jar ../build/chrome/

cd ..
cp *.rdf build
cp *.manifest build
cd build
zip -r $filename.xpi . -i *.rdf *.manifest *.jar
mv $filename.xpi ../
cd ..
rm -rf build

# git clone https://github.com/nmaier/xpisign.py.git
# add this for cert signing
# python xpisign.py -k cert.pem mailhops.xpi mailhops.signed.xpi
