
# Pinstream

**Pinstream** is a Node.js and MongoDB-powered image-sharing web app that allows users to register, log in, and upload media with custom tags. It includes a user dashboard, tag-based viewing, and basic user management utilities.

## Features

- User authentication (register/login)
- Upload images and GIFs
- View pins by tag
- Responsive dashboard layout
- Shell utilities for user and pin management
- MongoDB storage for users and media metadata

## Directory Structure

```
pinstream/
├── install.sh             # Interactive installer
├── uninstall.sh           # Cleanup script
├── package.json           # Node.js project metadata
├── server/                # Backend (Express, Mongoose)
│   ├── server.js
│   ├── models/
│   └── routes/
├── public_html/           # Frontend HTML/CSS/JS
│   ├── index.html
│   ├── dashboard.html
│   ├── uploads/
│   └── css/, js/
├── scripts/               # Admin utility scripts
```

## Installation

### Requirements

- Node.js (v20.19.0 recommended)
- MongoDB (local or remote)
- Linux environment (recommended for script compatibility)

### Step-by-Step

1. **Clone the Repo**
   ```bash
   git clone https://github.com/jetsonblack/pinstream.git
   cd pinstream
   ```

2. **Run Installer**
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

   This installs dependencies, sets up local binaries, and auto-generates a `.env` file with your MongoDB URI and port.

3. **Start the App**
   ```bash
   ./start-server
   ```

4. **Visit the Site**
   ```
   http://silo.cs.indiana.edu:{YOUR-PORT}
   ```

## Admin Utilities

Inside the `scripts/` folder:

- `viewUsers.js`: Displays registered users
- `deleteUsers.js`: Removes all users
- `viewAll.js`: Dumps pin metadata
- `shell.js`: Opens an interactive MongoDB shell helper

Run using:
```bash
node scripts/viewUsers.js
```

## Uninstallation

To remove everything installed by `install.sh`, run:

```bash
./uninstall.sh
```

# Pinstream Manual Setup Guide

This guide explains how to manually install, configure, and run the **Pinstream** application without using the install script.

---

## 1. Use Correct Node.js Version (v20.19.0)

recommend using **Node.js v20.19.0** to avoid compatibility issues. However limited testing does allow it to work on some other versions.

### Install and Use Node.js v20.19.0

```bash
nvm install 20.19.0
nvm use 20.19.0
```

Check version:

```bash
node -v
```

---

## 2. Install Node.js Dependencies

```bash
npm install
```

---

## 3. Download and Set Up MongoDB

```bash
mkdir -p mongodb
cd mongodb
wget https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu2204-7.0.5.tgz
tar -xvzf mongodb-linux-x86_64-ubuntu2204-7.0.5.tgz
mv mongodb-linux-x86_64-ubuntu2204-7.0.5 mongodb
rm mongodb-linux-x86_64-ubuntu2204-7.0.5.tgz
cd ..
```

---

## 4. Download and Set Up mongosh

```bash
wget https://downloads.mongodb.com/compass/mongosh-2.1.5-linux-x64.tgz
tar -xvzf mongosh-2.1.5-linux-x64.tgz
mv mongosh-2.1.5-linux-x64 mongosh
rm mongosh-2.1.5-linux-x64.tgz
```

---

## 5. Create MongoDB Data Directory

```bash
mkdir -p ./mongodb/data
```

---

## 6. Create `.env` File

```bash
cat <<EOL > .env
PORT=<APP_PORT>
MONGO_URL=mongodb://localhost:<MONGO_PORT>/pinstream
JWT_SECRET=secret
EOL
```

*(Adjust ports and secret)*

---

## 7. Start MongoDB

```bash
nohup ./mongodb/mongodb/bin/mongod \
  --dbpath ./mongodb/data \
  --port <MONGO_PORT> \
  --logpath ./mongodb/mongo.log \
  --fork
```

---

## 8. Start the Node.js Server

```bash
nohup node server/server.js > output.log 2>&1 &
echo $! > server.pid
```

---

## 9. Stop the Server

```bash
# Stop Node.js
[ -f server.pid ] && kill $(cat server.pid) 2>/dev/null && rm -f server.pid

# Stop MongoDB
ps -u <your_username> | grep mongod | awk '{print $1}' | xargs -r kill -9
```

Replace `<your_username>` with your actual Silo username.

---

## 10. Access Mongo Shell

```bash
./mongosh/bin/mongosh --port <MONGO_PORT>
```

---

