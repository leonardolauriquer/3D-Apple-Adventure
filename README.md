# 3D Apple Adventure

A mini 3D platformer game inspired by classics! Control the hero with WASD, jump with Space, and run through the world to collect all the apples. This project is built with React, Three.js, and Firebase.

![Game Screenshot](https://i.imgur.com/v8B5E0v.png)

## ✨ Features

- **Procedurally Generated Levels:** Every level is unique, offering endless replayability.
- **Dynamic Themes:** Experience over 20 different visual themes, from prairies and deserts to cyberpunk cities and haunted forests.
- **Rich Upgrade System:** Collect Upgrade Points to increase your speed, jump height, and maximum lives. Unlock special abilities like Double Jump, Triple Jump, and Ground Pound.
- **Character Customization:** Unlock and choose from various character skins to personalize your hero.
- **Diverse Enemies & Obstacles:** Face a growing roster of enemies (Skulls, Ghosts, Ram Bots) and navigate tricky hazards (Lasers, Stompers, Shrinking Platforms).
- **Epic Boss Battles:** Confront the mighty Skull King in challenging boss arenas every 10 levels.
- **Online Leaderboards:** Compete with players worldwide for the highest level reached (requires Firebase setup).
- **Offline Mode:** Play the game fully offline, with progress saved locally.
- **Multi-language Support:** The game is translated into 9 languages, including English, Portuguese, Spanish, and Japanese.
- **Daily Rewards:** Log in daily to claim rewards and build your streak.

## 🎮 Gameplay

### Controls
- **Desktop:**
  - **Move:** `W`, `A`, `S`, `D`
  - **Jump:** `Spacebar`
  - **Ground Pound:** `C` or `Shift`
- **Mobile:**
  - **Move:** On-screen virtual joystick.
  - **Jump:** On-screen jump button (`↑`).
  - **Ground Pound:** On-screen pound button (`⇓`).

### Objective
The goal in each level is simple: **collect all the red apples**. Once you've gathered every apple, the exit portal will activate, allowing you to proceed to the next, more challenging stage.

## 🛠️ Tech Stack

- **Frontend:** [React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)
- **3D Engine:** [Three.js](https://threejs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Backend Services:** [Firebase](https://firebase.google.com/)
  - **Authentication:** For Google Sign-In.
  - **Firestore:** To store and retrieve leaderboard data.
- **Build Tool:** [Vite](https://vitejs.dev/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation & Running Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/3d-apple-adventure.git
    cd 3d-apple-adventure
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Firebase Setup (for Online Features)

To enable online rankings and Google login, you need to set up a Firebase project.

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  Add a new Web App to your project.
3.  Copy the Firebase configuration object provided.
4.  Paste your configuration into the `src/config/firebase.ts` file, replacing the placeholder credentials.
5.  In the Firebase Console, go to **Authentication** -> **Sign-in method** and enable the **Google** provider.
6.  Go to **Firestore Database** and create a new database in production mode. You will need to create a `leaderboard` collection with the appropriate security rules.
7.  **Important for Development:** When you run the project locally using `npm run dev`, the app will run on a unique domain like `*.googleusercontent.com`. The login screen will detect this and guide you to add this domain to the list of **Authorized domains** in your Firebase Authentication settings. This step is necessary to test Google Sign-In.

## 📁 Project Structure

```
.
├── public/
├── src/
│   ├── components/      # React components (UI and Game)
│   │   ├── game/        # In-game components (3D canvas, controls)
│   │   └── ui/          # UI components (Menus, HUD, etc.)
│   ├── config/          # Game constants, translations, Firebase config
│   ├── game/            # Core game logic (level generation, models)
│   ├── hooks/           # Custom React hooks (useGameState, useTranslation)
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Helper functions (audio, gameplay logic)
│   ├── App.tsx          # Main application component
│   └── index.tsx        # React entry point
├── README.md
├── package.json
└── vite.config.ts
```

## 💖 Contributing

Contributions are welcome! If you have ideas for new features, bug fixes, or improvements, please feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
