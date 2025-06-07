FROM node:22.12.0

RUN apt-get update && \
	apt install -y iputils-ping && \
    apt-get install -y nginx openssl sqlite3

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN mkdir public public/images public/pages

RUN cp ./src/ui/images -r public/
RUN cp ./src/ui/pages -r public/
RUN cp ./src/ui/index.html public/
RUN cp ./src/ui/pong.png public/

RUN node --run css && node --run js && node --run migrate

COPY --chmod=0777 ./tools/ssl.sh /

CMD ["/ssl.sh"]