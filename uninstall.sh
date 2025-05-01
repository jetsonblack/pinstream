#!/bin/bash

echo "=== Uninstalling Pinstream App ==="

read -p "Enter your Silo username (to safely kill MongoDB processes): " SILO_USER

# Stop Node.js server if running
if [ -f server.pid ]; then
  echo "Stopping Node.js server..."
  kill $(cat server.pid) 2>/dev/null
  rm -f server.pid
fi

# Stop MongoDB processes owned by the given user
echo "Stopping MongoDB processes for user: $SILO_USER..."
ps -u $SILO_USER | grep mongod | awk '{print $1}' | xargs -r kill -9

# Remove generated files
echo "Removing generated files..."
rm -f .env output.log start-server.sh stop-server.sh mongoshell

# Optional cleanup
read -p "Do you also want to delete MongoDB binaries (./mongodb)? (y/n): " DELETE_MONGO
if [ "$DELETE_MONGO" == "y" ]; then
  rm -rf ./mongodb
  echo "MongoDB binaries removed."
fi

read -p "Do you want to delete mongosh shell (./mongosh)? (y/n): " DELETE_SHELL
if [ "$DELETE_SHELL" == "y" ]; then
  rm -rf ./mongosh
  echo "mongosh shell removed."
fi

read -p "Do you want to delete node_modules? (y/n): " DELETE_NODE
if [ "$DELETE_NODE" == "y" ]; then
  echo "Force removing node_modules..."
  find node_modules/ -type f -exec chmod u+w {} \;
  rm -rf node_modules
  echo "node_modules forcibly removed."
fi

echo "Uninstallation complete."
