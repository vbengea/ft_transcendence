#!/bin/sh

# Generate self-signed SSL certificate if not exists
# In production with nginx reverse proxy, nginx handles SSL termination
# This certificate is only used for internal container communication

if [ ! -f "$TKEY" ] || [ ! -f "$TCRT" ]; then
    echo "Generating self-signed SSL certificate..."
    openssl req -x509 \
        -nodes -days 365 \
        -newkey rsa:2048 \
        -keyout "$TKEY" \
        -out "$TCRT" \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN_NAME"
    echo "SSL certificate generated successfully"
else
    echo "SSL certificate already exists"
fi

# Run database migrations
echo "Running database migrations..."
cd /app
npx prisma migrate deploy --schema=./src/server/prisma/schema.prisma

# Start the Node.js application
echo "Starting application on port $PORT..."
exec node --run start

