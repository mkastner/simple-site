#!/usr/bin/env bash
/usr/bin/env rsync -avzh -e "ssh -p 2215"  --progress \
  ~/projects/node.js/simple-site/custom/awards/dist/ \
  webhost@static.fmh.de:/home/webhost/www/static.fmh.de/sites/awards/
