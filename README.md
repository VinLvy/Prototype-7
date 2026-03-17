# ReLife RPG (Prototype-7)

ReLife RPG is a gamified life-tracking application that transforms your daily activities and achievements into RPG statistics. By logging your daily progress, the integrated **Google Gemini AI** analyzes your entries and awards you experience points (XP) and stat increases across six core attributes: **Strength**, **Intelligence**, **Charisma**, **Creativity**, **Wisdom**, and **Wealth**.

![ReLife RPG Dashboard](./src/assets/dashboard.png)

## 🚀 Features

*   **AI-Powered Journaling**: Simply write about your day, and Gemini AI analyzes your actions to determine which stats improve.
*   **Hexagon Stat System**: Visualize your personal growth with a dynamic Radar Chart showing your balance across 6 key attributes.
*   **Leveling System**: Gain XP, level up, and earn **Skill Points** to manually allocate to your desired stats.
*   **Gamified Progression**: Unlock unique **Titles** and **Character Classes** based on your stat distribution (e.g., reaching high Intelligence unlocks the "Sage" title).
*   **Modern Cyberpunk UI**: A sleek, dark-mode interface featuring glassmorphism, smooth animations (Framer Motion), custom in-app notifications, and responsive design.
*   **Profile Management (Origin Story)**: Customize your profile with a cropped avatar, username, and selectable titles.
*   **Account Controls**: Manage your account with features like auto-logout on session timeout and an option to completely reset your account progress from settings.
*   **Secure Authentication**: User management powered by Supabase.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: [React](https://react.dev/) (with [Vite](https://vitejs.dev/))
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Charts**: [Recharts](https://recharts.org/)
*   **Icons**: [Lucide React](https://lucide.dev/)

### Backend & Infrastructure
*   **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
*   **AI Model**: [Google Gemini API](https://ai.google.dev/) (`gemini-2.5-flash`)

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/prototype-7.git
    cd prototype-7
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory and add your Supabase and Gemini credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_GEMINI_API_KEY=your_gemini_api_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

## 📂 Project Structure

```text
src/
├── components/       # Reusable UI components (HexagonChart, LevelUpCelebration, etc.)
├── lib/              # Core logic and configuration
│   ├── db.ts         # User stats and database operations
│   ├── gemini.ts     # AI analysis and API interaction
│   └── supabase.ts   # Supabase client setup
├── pages/            # Main application views (Dashboard, Login, Signup)
└── App.tsx           # Main application entry and routing
```

## 🎮 How It Works

1.  **Log In**: creating an account via Supabase.
2.  **Dashboard**: You are greeted with your current level, XP progress, and stat chart.
3.  **Journal Entry**: Type what you did today (e.g., "Went to the gym for 2 hours and read a book about finance").
4.  **AI Analysis**: The system sends your entry to Gemini, which determines that you gained **Strength** (Gym) and **Intelligence/Wealth** (Finance book).
5.  **Growth**: Watch your stats rise, your level increase, and unlock new possibilities!

## 📜 License

This project is licensed under the MIT License.
