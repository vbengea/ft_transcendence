#!/bin/bash


# Función para crear 10 usarios a través de la API de autenticación
create_users() {
	for i in {1..10};
	do
		curl -k -X POST https://localhost:3000/auth/register \
		-H "Content-Type: application/json"   \
		-d "{
			\"name\": \"user$i\",
			\"email\": \"user$i@test.com\",
			\"password\": \"User_01\"
		}"
	done
}

# Función para crear relaciones de amistad de los 10 usarios mediante inserciones directas en la base de datos
# Ejemplo de uso: ./tools/automations.sh create_friendship
create_friendship() {
	registers=$(docker exec pong sqlite3 src/server/db/data.db "SELECT id FROM user WHERE email LIKE 'user%';")
	# Convertir a array
	readarray -t WORDS <<< "$registers"

	# Doble iteración
	for ((i=0; i<${#WORDS[@]}; i++)); do
		for ((j=i+1; j<${#WORDS[@]}; j++)); do
			docker exec pong sqlite3 src/server/db/data.db "INSERT INTO _UserFriends (A, B) VALUES ('${WORDS[i]}', '${WORDS[j]}');"
		done
	done
}

if [ "$1" ]; then
	$1
fi

create_users
create_friendship