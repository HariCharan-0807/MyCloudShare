# ☁️ MyCloudShare

**Secure cloud file storage — upload, preview, and manage your files from anywhere.**

MyCloudShare is a lightweight, browser-based cloud storage application powered by [Supabase](https://supabase.com). It provides a clean, modern interface for uploading, viewing, and managing files with built-in user authentication.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Sign up & sign in with email/password via Supabase Auth |
| 📤 **File Upload** | Upload files through a file picker or drag-and-drop |
| 🖼️ **Image Preview** | View uploaded images in a full-screen lightbox overlay |
| 📝 **Document Preview** | Preview PDF and DOCX files using Google Docs Viewer |
| ⬇️ **Download** | One-click download for any uploaded file |
| 🗑️ **Delete** | Remove files from your cloud storage instantly |
| 📱 **Responsive** | Clean, card-based UI that works across devices |

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3 (vanilla), JavaScript (ES6+)
- **Backend / BaaS:** [Supabase](https://supabase.com)
  - **Auth** — Email/password authentication
  - **Storage** — File upload and public URL generation
  - **Database** — PostgreSQL for file metadata (name, URL, owner)
- **External Services:**
  - Google Docs Viewer — for in-browser document preview

---

## 📁 Project Structure

```
MyCloudShare/
├── index.html    # Main HTML — login screen & app screen
├── style.css     # All styles — login, upload, file list, lightbox
├── logic.js      # App logic — auth, upload, file management, lightbox
└── README.md     # This file
```

---

## 🚀 Getting Started

### Prerequisites

- A [Supabase](https://supabase.com) project with:
  - **Authentication** enabled (email/password provider)
  - A **Storage bucket** named `uploads`
  - A **`files` table** with columns: `id`, `name`, `url`, `owner_email`, `created_at`

### Setup

1. **Clone or download** this repository.
2. Open `logic.js` and replace the Supabase credentials with your own:
   ```js
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_KEY = 'your-anon-key';
   ```
3. **Open `index.html`** in a browser — no build step required!

### Supabase Table Schema

```sql
CREATE TABLE files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 📸 Screenshots

> _Coming soon — see the app in action!_

---

## 📄 License

This project is open-source and available under the [MIT License](https://opensource.org/licenses/MIT).
