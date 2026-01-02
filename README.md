# FORGE.

**Execution Intelligence for Deep Work.**

FORGE is a premium productivity system designed to replace chaotic task lists with a structured execution protocol. It combines psychological triggers, flow state mechanics, and rigorous data isolation to force deep work sessions.

![Forge Banner](public/og-image.jpg) *<!-- Replace with actual screenshot path if available -->*

## ⚡ Core Philosophy

Tasks are just symptoms. **Execution** is the cure.
Most apps optimize for *planning* (listing things). FORGE optimizes for *doing* (locking in and finishing things).

## 🚀 Key Features

### 1. The Planner (Structure)
- **Living Calendar**: Visual week view to lock tasks to dates.
- **Energy & Priority**: Tag tasks not just by urgency, but by required energy level.
- **Strict Parsing**: Tasks are either "Pending" or "Forged" (Completed). No limbo state.

### 2. The Focus Protocol
A guided 5-stage ritual to enter Flow State:
1.  **Entry Ritual**: Psychological priming to detach from distractions.
2.  **Lock-In**: Selecting a *single* target. No multi-tasking allowed.
3.  **Deep Focus**: A dynamic timer that reacts to your intensity.
    *   *Visuals*: The "Forge Ring" heats up (Blue -> Purple -> Red/Gold) as you persist.
    *   *Penalty System*: Leaving the window or pausing cools down the forge and decays intensity.
4.  **Completion**: Dopamine-rich celebration for finished work.
5.  **Exit Summary**: Review of what was accomplished.

### 3. Analytics & Progression
- **Heatmap**: GitHub-style contribution graph for your focus minutes.
- **RPG Metrics**: Earn XP, level up, and unlock badges (e.g., "Iron Will", "Deep Focus").
- **Streak Protection**: Robust streak tracking to build momentum.

### 4. Enterprise-Grade Architecture
- **Supabase Auth**: Secure email-based login with strict data isolation.
- **Zustand Persistence**: Local-first state management for instant interactions.
- **Safe Resets**: "Factory Reset" capability for meaningful fresh starts.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: JavaScript (React 19)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + CSS Variables
- **Animations**: [Framer Motion](https://www.framer.com/motion/) (Complex orchestrations)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (with Persistence middleware)
- **Backend / Auth**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase Project

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/forge.git
    cd forge
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to enter the Forge.

## 🗄️ Database Schema (Supabase)

The system requires two main tables in your public schema:

**1. `profiles`**
- `id`: uuid (references auth.users)
- `email`: text
- `name`: text
- `updated_at`: timestamp

**2. `tasks`**
- `id`: uuid
- `user_id`: uuid (references profiles.id)
- `title`: text
- `status`: text ('pending' | 'completed')
- `priority`: text
- `energy`: text
- `duration`: integer
- `created_at`: timestamp

*(Note: Row Level Security (RLS) policies should be enabled to ensure users only access their own data.)*

## 🔒 Security & Privacy

FORGE implements **Hygienic Auth**:
- Sessions are strictly scoped to confirmed users.
- Data is isolated by `user_id` at the RLS level.
- Local storage is wiped upon logout to prevent data leaks on shared devices.

---

**FORGE** — *Build. Burn. Become.*
