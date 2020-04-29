#!/bin/bash

result=$(docker inspect -f '{{.State.Running}}' bc-redis)

if [ "$result" = true ]; then
  echo "Redis container is already running"
else
  echo "Redis container not running"
  docker run --rm --name bc-redis -p 6379:6379 -d redis > /dev/null
  echo "Redis container now running"
fi
