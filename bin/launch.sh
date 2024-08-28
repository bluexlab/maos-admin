#!/bin/bash

DATABASE_URL="postgres://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}"
export DATABASE_URL

dumb-init node server.js &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
