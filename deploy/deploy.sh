#!/bin/bash

DEPLOY_SERVER="pos.vttech.dev"
SERVER_FOLDER="vtt.im/pos.vtt.im"
NODE_PATH="/opt/plesk/node/14/bin"
export PATH="$PATH:${NODE_PATH}"
node -v
npm -v
npm install \
|| exit 1
npm run build

echo "Deploying to ${DEPLOY_SERVER}"
cd build
scp -r * root@${DEPLOY_SERVER}:/var/www/vhosts/${SERVER_FOLDER}/

echo "Finished copying the build files"
