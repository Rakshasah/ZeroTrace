# ZeroTrace
> **Professional End-to-End Encrypted Communication Platform**

![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)
![Security](https://img.shields.io/badge/encryption-AES--256--GCM-red.svg?style=flat-square)
![Key Exchange](https://img.shields.io/badge/key%20exchange-ECDH%20P--256-orange.svg?style=flat-square)
![Status](https://img.shields.io/badge/status-production--ready-green.svg?style=flat-square)

**ZeroTrace** is a zero-knowledge messaging architecture designed to demonstrate advanced cryptographic principles in a modern web application. It ensures complete privacy by performing all encryption operations client-side, treating the server as a blind data relay.

---

## 🔐 Security Architecture

The core of ZeroTrace is its defense-in-depth security model:

| Feature | Implementation Details |
| :--- | :--- |
| **Encryption** | **AES-256-GCM** (Galois/Counter Mode). Provides both confidentiality and integrity. |
| **Key Exchange** | **ECDH (Elliptic Curve Diffie-Hellman)** on the **NIST P-256** curve. |
| **Secrecy** | **Perfect Forward Secrecy (PFS)**. Session keys are ephemeral, generated in volatile memory (RAM), and rotated on every login. |
| **Storage** | **Zero-Knowledge Storage**. The server stores only encrypted blobs (`ciphertext` + `iv`). It never possesses the private keys required to decrypt them. |

## 🚀 Native Capabilities

### 🛡️ Secure Identity Handshake
Automatically negotiates shared secrets between peers using asynchronous public key exchange. If a peer rotates their keys (e.g., restarts session), the system detects the mismatch and prompts for an instant secure handshake repair.

### ⏳ Ephemeral Messaging (Time-To-Live)
Built-in **"Auto-Wipe"** protocol. Users can define a guaranteed lifespan for messages (e.g., `5 minutes`, `1 hour`).
*   **Visual Destruction**: Messages vanish from the UI in real-time.
*   **Server Sanitization**: A background cron job physically expunges expired records from the database, leaving no digital footprint.

### ⚡ Reactive UX/UI
*   **Real-time**: Powered by **Socket.IO** for sub-millisecond latency.
*   **Aesthetics**: "Glassmorphism" interface built with **TailwindCSS v4** and **Framer Motion** for smooth, purely native animations.

---

## 🛠️ Technology Stack

*   **Frontend**: React 18, TypeScript, Vite, Web Crypto API (SubtleCrypto)
*   **Backend**: Node.js, Express, Prisma ORM
*   **Database**: MySQL / SQLite
*   **Infrastructure**: Docker Ready

---

## � Rapid Deployment

This project includes automated ecosystem management scripts for instant deployment.

### 1. Automated Setup
Execute the initialization script to install dependencies, execute database migration, and build the production bundle.
```cmd
setup.bat
```

### 2. Launch System
Start both the secure backend node and the client interface with a single command.
```cmd
start_app.bat
```

---

## ⚠️ Compliance & Disclaimer

This software serves as a **portfolio demonstration** of high-level software engineering and cryptographic implementation skills.
While it utilizes industry-standard algorithms (NIST P-256, AES-GCM) implemented via the native Web Crypto API, it is recommended to conduct a full security audit before deploying in high-risk environments.

---
