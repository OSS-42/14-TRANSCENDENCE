#!/bin/sh

# Add debugging output
echo "Waiting for Nginx service..."

# Wait for Nginx to be ready
wait-for-it.sh nginx:80 -- echo "Nginx is ready."

# Start your frontend application
npm run dev