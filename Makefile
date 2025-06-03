#!make
include .env
export

NAME =	pong

build:
	docker build -t pong .

run: build
	docker run --name $(NAME) --env-file .env -p $(PORT):$(PORT) $(NAME)

down:
	docker stop $(NAME)
	docker container rm $(NAME)
	docker rmi $(NAME)

res: down run

cli:
	docker exec -it pong sh

gitter:
	git add -A
	git commit -am '$m'
	git push
