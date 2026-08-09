# 👻 GhostPen

> **Some information shouldn't live forever.**

GhostPen is a privacy-first digital dead drop for securely delivering sensitive evidence through temporary channels.

**Create → Protect → Encrypt → Deliver → Decrypt → Burn**

---

## 🎯 The Problem

Sensitive information is often shared through tools designed for conversations and permanent storage.

But sometimes, you don't need a conversation.

You need a **temporary delivery channel**.

GhostPen allows a source to submit evidence through a temporary link while protecting the evidence before it reaches the server.

---

## ✨ Key Features

### 🛡️ Metadata Shield

GhostPen scans supported JPG, JPEG and PNG images for potentially identifying EXIF metadata, including:

- GPS location
- Camera/device information
- Capture timestamp
- Software information

If metadata is detected, the image can be sanitized locally before submission.

---

### 🔐 Client-Side Encryption

GhostPen uses the browser's **Web Crypto API with AES-GCM**.

Evidence is encrypted in the browser before transmission.

The encryption key remains client-side and is not sent to the backend.

---

### ⏳ Ephemeral Evidence Drops

Every drop has a limited lifetime.

Once a drop expires, it becomes inaccessible instead of becoming a permanent evidence repository.

---

### 🔓 Local Decryption

Encrypted evidence is decrypted inside the journalist's browser.

The backend acts as a temporary relay rather than a plaintext evidence viewer.

---

### 🔥 Session Burn

The creator can destroy an active session.

GhostPen then:

- Deletes the server-side drop
- Clears the local encryption key
- Invalidates the session

---

### 🎬 Interactive Demo

Experience the complete GhostPen workflow without creating a real drop:

**Privacy Scan → Sanitize → Encrypt → Submit → Decrypt → Burn**

---

## 🔄 How It Works

```text
        JOURNALIST
            │
            ▼
     Create Temporary Drop
            │
            ▼
      Share Source Link
            │
            ▼
          SOURCE
            │
            ▼
      Submit Evidence
            │
            ▼
   Metadata Scan → Sanitize
            │
            ▼
     AES-GCM Encryption
            │
            ▼
   Temporary Backend Relay
            │
            ▼
   Journalist Dashboard
            │
            ▼
      Local Decryption
            │
            ▼
       🔥 Burn Session
```

---

## 🧱 Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Framer Motion

### Security & Privacy

- Web Crypto API
- AES-GCM
- exifr
- Canvas API

### Backend

- Node.js
- Express

### Storage

- Ephemeral in-memory storage

---

## 🔒 Security Model & Limitations

GhostPen is designed to reduce unnecessary exposure of sensitive evidence.

It does **not** claim absolute anonymity, untraceability, or protection against every form of surveillance.

GhostPen does not protect against:

- IP or network-level metadata
- Browser/device fingerprinting
- Screenshots or external recordings
- Malware or compromised devices
- Compromised hosting infrastructure
- Metadata types not currently supported
- Information voluntarily included inside submitted evidence

The project intentionally avoids making unrealistic security claims.

---

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY
cd GhostPen
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Start the frontend

```bash
npm run dev
```

### 4. Start the backend

Open another terminal:

```bash
cd server
npm install
node index.js
```

---


## 🔮 Future Improvements

- Redis-backed ephemeral storage
- Broader metadata sanitization for documents
- Additional transport/privacy protections
- Production security auditing
- More granular retention controls

---


<p align="center">

<strong>👻 GhostPen</strong>

<br>

Create. Protect. Deliver. Decrypt. Burn.

</p>
