#!/bin/sh
docker compose down -v && docker system prune -a -f && docker volume prune -f
cd ./backend && rm -rf dist/ node_modules/ prisma/migrations package-lock.json