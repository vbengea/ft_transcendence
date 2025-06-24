FROM node:22.12.0

RUN apt-get update && \
	apt install -y iputils-ping && \
    apt-get install -y nginx openssl sqlite3 python3 pip python3.11-venv

RUN curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
	| tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null \
	&& echo "deb https://ngrok-agent.s3.amazonaws.com buster main" \
	| tee /etc/apt/sources.list.d/ngrok.list \
	&& apt update \
	&& apt install ngrok

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN mkdir public

RUN cp ./src/ui/images -r public/
RUN cp ./src/ui/pages -r public/
RUN cp ./src/ui/languages -r public/
RUN cp ./src/ui/pages/index.html public/
RUN cp ./src/ui/images/favicon.ico public/
RUN cp ./src/ui/styles/main.css public/

RUN node --run css && node --run js && node --run migrate

COPY --chmod=0777 ./tools/ssl.sh /

CMD ["/ssl.sh"]
