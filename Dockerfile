FROM node:22.12.0

RUN apt-get update && \
	apt install -y iputils-ping && \
    apt-get install -y nginx openssl

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN mkdir public
RUN cp ./src/ui/index.html public/
RUN cp ./src/ui/pong.png public/
RUN node --run css
RUN node --run js

COPY --chmod=0777 ./tools/ssl.sh /

CMD ["/ssl.sh"]