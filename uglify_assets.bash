#!/bin/bash -e

cd www/luci-static/resources/arduino

rm -f *.ugly.*

for js in aes-enc base64 webpanel mouse PGencode PGpubkey rsa sha1; do
  /home/tjbenne/YunWebUI/node_modules/uglify-js/bin/uglifyjs -o $js.ugly.js $js.js
done

for js in aes-enc base64 mouse PGencode PGpubkey rsa sha1; do
  cat $js.ugly.js >> gpg.ugly.js
  rm -f $js.ugly.js
done

/home/tjbenne/YunWebUI/node_modules/uglifycss/uglifycss style.css > style.ugly.css