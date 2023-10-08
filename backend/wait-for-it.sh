#!/bin/sh
# wait-for-it.sh
# Waits for a service to be ready before executing a command.

host="$1"
port="$2"
cmd="$3"

# Function to check if the given host and port are reachable
wait_for() {
  until nc -z -v -w30 "$host" "$port"; do
    echo "Waiting for $host:$port..."
    sleep 1
  done
  echo "$host:$port is available!"
}

if [ "$cmd" = "help" ]; then
  echo "Usage: wait-for-it.sh host:port [-s] [-- command args]"
  echo ""
  echo "  -s, --strict   Only execute subcommand if the server is up"
  echo "  -- command args   Execute the command with args after the test finishes"
  exit 0
fi

if [ "$1" = "--strict" ]; then
  host="$2"
  port="$3"
  shift 3
else
  shift 2
fi

wait_for

# Once the host and port are available, execute the command (if provided)
exec "$@"