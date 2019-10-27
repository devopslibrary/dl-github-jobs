#!/bin/sh
export PRIVATE_KEY=`cat kondo-io.2019-10-26.private-key.pem`
export APP_ID=30108
yarn serve
echo 'Finished'
