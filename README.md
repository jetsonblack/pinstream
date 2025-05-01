
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
