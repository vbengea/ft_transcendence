#!/bin/bash

cd /app
npm run js

cat /app/public/main.js | sed "s|{HOST}|$HOST|g" | sed "s|{PORT}|$PORT|g" > /app/public/main.js.tmp
mv /app/public/main.js.tmp /app/public/main.js

openssl \
	req -x509 \
	-nodes -days 365 \
	-newkey rsa:2048 \
	-keyout $TKEY \
	-out $TCRT \
	-subj "/C=ES/ST=Madrid/L=Madrid/CN=$DOMAIN_NAME"

node --run start
