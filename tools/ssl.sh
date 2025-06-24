#!/bin/bash

openssl \
	req -x509 \
	-nodes -days 365 \
	-newkey rsa:2048 \
	-keyout $TKEY \
	-out $TCRT \
	-subj "/C=ES/ST=Madrid/L=Madrid/CN=$DOMAIN_NAME"

# ngrok config add-authtoken $NGROK_AUTHTOKEN

node --run start 
#&
# NODE_PID=$!

# sleep 3

# ngrok http --domain=$NGROK_DOMAIN https://localhost:$PORT

# kill $NODE_PID
