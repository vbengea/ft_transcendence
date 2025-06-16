#!/bin/bash

# Función para crear 10 usarios a través de la API de autenticación
# Ejemplo de uso: ./tools/automations.sh create_users
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

if [ "$1" ]; then
	$1
fi
