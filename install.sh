#!/bin/bash

echo "=== Pinstream App Installer ==="

# Check Node.js version
EXPECTED_NODE_VERSION="v20.19.0"
CURRENT_NODE_VERSION=$(node -v)

if [ "$CURRENT_NODE_VERSION" != "$EXPECTED_NODE_VERSION" ]; then
  echo ""
  echo "? WARNING: Expected Node.js version $EXPECTED_NODE_VERSION but found $CURRENT_NODE_VERSION"
  echo "This may cause runtime issues."
  echo ""
  echo "To switch Node.js versions on Silo:"
  echo "1. List available versions: module avail nodejs"
  echo "2. Load the correct version: module load nodejs/20.19.0"
  echo "3. Retry running this script"
  echo ""
  read -p "Press Enter to continue anyway..."
fi

# Prompt for configuration values
read -p "Enter the port number for the Node.js server: " APP_PORT
read -p "Enter the custom MongoDB port (e.g., 12005): " MONGO_PORT
read -p "Enter the absolute path for MongoDB data storage (press Enter to use ./mongodb): " MONGO_DATA_PATH
MONGO_DATA_PATH=${MONGO_DATA_PATH:-"./mongodb"}
read -p "Enter your Silo username (for safe process filtering): " SILO_USER
read -p "Enter JWT secret (press Enter to use default 'secret'): " JWT_SECRET
JWT_SECRET=${JWT_SECRET:-secret}

# Create MongoDB data directory if it doesn't exist
mkdir -p "$MONGO_DATA_PATH"

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Download and install MongoDB if not already present
MONGO_DIR="./mongodb/mongodb"
if [ ! -d "$MONGO_DIR" ]; then
  echo "Downloading MongoDB binaries..."
  mkdir -p ./mongodb
  cd ./mongodb
  wget https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu2204-7.0.5.tgz
  tar -xvzf mongodb-linux-x86_64-ubuntu2204-7.0.5.tgz
  mv mongodb-linux-x86_64-ubuntu2204-7.0.5 mongodb
  rm mongodb-linux-x86_64-ubuntu2204-7.0.5.tgz
  cd ..
else
  echo "MongoDB already installed."
fi

# Download and extract mongosh shell if not already present
if [ ! -d "./mongosh" ]; then
  echo "Installing mongosh shell..."
  wget https://downloads.mongodb.com/compass/mongosh-2.1.5-linux-x64.tgz
  tar -xvzf mongosh-2.1.5-linux-x64.tgz
  mv mongosh-2.1.5-linux-x64 mongosh
  rm mongosh-2.1.5-linux-x64.tgz
fi

# Create .env file
cat <<EOL > .env
PORT=$APP_PORT
MONGO_URI=mongodb://localhost:$MONGO_PORT/pinstream
JWT_SECRET=$JWT_SECRET
EOL

echo ".env file created with configured ports and JWT secret."

# Create start script
cat <<EOL > start-server.sh
#!/bin/bash
echo "Starting MongoDB on port $MONGO_PORT..."
nohup ./mongodb/mongodb/bin/mongod \
  --dbpath $MONGO_DATA_PATH \
  --port $MONGO_PORT \
  --logpath ./mongodb/mongo.log \
  --fork

echo "Starting Node.js server on port $APP_PORT..."
nohup node server/server.js > output.log 2>&1 &
echo $! > server.pid
EOL
chmod +x start-server.sh

# Create stop script
cat <<EOL > stop-server.sh
#!/bin/bash
echo "Stopping Node.js server..."
[ -f server.pid ] && kill \$(cat server.pid) 2>/dev/null && rm -f server.pid

echo "Stopping MongoDB for user: $SILO_USER..."
ps -u $SILO_USER | grep mongod | awk '{print \$1}' | xargs -r kill -9
EOL
chmod +x stop-server.sh

# Create mongoshell launcher
cat <<EOL > mongoshell
#!/bin/bash
./mongosh/bin/mongosh --port $MONGO_PORT
EOL
chmod +x mongoshell

echo "Installation complete."
echo "Use ./start-server.sh to run, ./stop-server.sh to stop, and ./mongoshell to access the Mongo shell."
