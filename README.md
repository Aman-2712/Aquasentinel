# AquaSentinel (V1.0)
**Visakhapatnam Unified Flood Intelligence, Automated FieldShield & Disaster Management System**

---

## ⚡ Quick Start for Teammates (1-Click Setup)

If you are setting up or updating the repository on your local computer, simply run the automatic setup script:

### Windows:
Double-click `setup.bat` or run in PowerShell / Command Prompt:
```cmd
.\setup.bat
```

### Mac / Linux:
Run in Terminal:
```bash
chmod +x setup.sh
./setup.sh
```

The script automatically fetches the latest code, sets up `.env.local`, repairs corrupted local AI assistant hook configs, installs dependencies, and starts `npm run dev`.

---

## 🔑 Role Portals & Logins

AquaSentinel features specialized role-based authentication & dashboards:

| Persona / Role | Login URL | Description |
| :--- | :--- | :--- |
| **👤 Citizen** | `/citizen/login` | Citizen Safety Home: Flood Warnings, 7-Day Forecast, Safe Routes, Municipal Broadcasts. |
| **🌾 Farmer** | `/farmer/login` | Farmer FieldShield Home: Soil Saturation, Automated Barrier Controls, Crop Protection. |
| **🏛️ Authority** | `/authority/login` | Visakhapatnam Command Center: Sluice Gate Control, Rescue SOS Dispatch, Emergency Alert Broadcaster. |

---

## ⚙️ Manual Installation & Setup

1. **Clone / Fetch Repository**:
   ```bash
   git fetch origin main
   git reset --hard origin/main
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

4. **Run Local Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Troubleshooting AI Assistant Hook Errors

If your Antigravity AI Assistant displays a pre-execution hook error such as:
`JSON hook "jsonhook_googlecloudtools.datacloud_telemetry_PreToolUse_0_0" failed: Error: Cannot find module...`

### Solution:
1. Open Windows File Explorer and go to:
   `C:\Users\<your-username>\.gemini\config`
2. Delete the `hooks.json` file or delete the `plugins` folder.
3. Restart your Antigravity IDE / assistant window.
