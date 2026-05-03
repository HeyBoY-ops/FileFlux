# 💻 FileFlux Terminal Engine

## 📖 Project Overview
FileFlux is an advanced, web-based Command Line Interface (CLI) simulation engineered to replicate standard Unix-like file system operations directly within a browser environment. 

Unlike traditional isolated terminal emulators, FileFlux features a **Singleton Global State architecture**. This allows for real-time, multi-user collaboration within a shared virtual file system in the cloud. It natively supports dynamic path resolution, relative directory traversal (`.`, `..`), deterministic wildcard expansion (`*`), and real-time state synchronization.

**Live Link:** [fileflux-swart.vercel.app](https://fileflux-swart.vercel.app)

---

## 🛠️ Tech Stack

**Frontend:**
*   **React:** For building the responsive, state-driven user interface.
*   **TypeScript:** Ensuring strict typing and reliable cross-component communication.

**Backend:**
*   **Node.js & Express.js:** To handle asynchronous API routing and command execution.
*   **TypeScript:** For robust object-oriented system design and pattern implementation.

**Database / Storage:**
*   **In-Memory RAM (Cloud):** The system uses a specialized $O(1)$ `Map<string, FileSystemNode>` data structure stored in the backend server's RAM. 

**Deployment & Tools:**
*   **Vercel:** Frontend UI hosting.
*   **Render:** Backend engine hosting.
*   **Git / GitHub:** Version control and collaboration.

---

## ⚙️ Setup and Installation Instructions

To set up the FileFlux engine locally on your machine, ensure you have **Node.js** (v16 or higher) and **Git** installed.

**1. Clone the repository:**

```bash
git clone [https://github.com/HeyBoY-ops/FileFlux.git](https://github.com/HeyBoY-ops/FileFlux.git)
cd FileFlux
```

**2. Install Backend Dependencies**
Navigate to the backend directory and install the required Node modules.

```bash
cd backend
npm install
```

**3. Install Frontend Dependencies**
Open a new terminal window, navigate to the client directory, and install the UI dependencies.

```bash
cd frontend
npm install
```

## 🚀 How to Run the Project

Once the dependencies are installed, you need to run both the backend server and the frontend client concurrently.

**1. Start the Backend Server**
In your server terminal, start the Express engine:

```bash
npx tsx server.ts
```
**2. Start the Frontend UI**

In your client terminal, start the React application:

```bash
npm run dev
```

## 🏗️ Architecture Explanation

The FileFlux engine is decoupled into three highly maintainable tiers, leveraging standard Object-Oriented Programming and System Design principles:

**1. Core Tier (Data Structures):** 
  This layer defines the underlying logic using the Composite Design Pattern. An abstract `FileSystemNode` serves as the base. `FileNode` objects manage string-based content, while `DirectoryNode` objects manage an internal Map of child nodes. Using a Map instead of an Array ensures $O(1)$ time complexity for file lookups and prevents array-mutation bugs during deletion.
  
**2. Engine Tier (State & Resolution):** 
  This tier acts as the central brain. A single `FileSystem` instance (Singleton Pattern) is created when the server starts, ensuring all connected users interact with the exact same file tree. Utility classes like `PathResolver` handle complex input conversions (e.g., translating `cd ../*` into actual directory node pointers).
  
**3. Shell Tier (Orchestration):** 
  This layer manages user inputs using the Command Design Pattern. The `CommandProcessor` receives sanitized strings from the API and looks up commands in an internal registry mapped to the `ICommand` interface. This ensures adding a new command only requires creating a new class, without altering the core routing logic.
