#!/usr/local/bin/bash
/usr/local/bin/rsync -avzh -e "ssh -p 2215"  --progress \
  /home/devel/projects/node.js/simple-site/custom/khe/ \
  webhost@www.kaminholz-exklusiv.de:/home/webhost/www/www.kaminholz-exklusiv.de/simple-site/custom/khe/ 
