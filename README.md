# 🚀 Project Management Dashboard

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232a?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Chakra UI](https://img.shields.io/badge/Chakra%20UI-3.3-319795?style=for-the-badge&logo=chakra-ui&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

A modern, full-stack Project Management Dashboard built to streamline workflow, manage tasks, and visualize project progress. Features a robust backend API and a responsive, interactive frontend interface.

## ✨ Features

- **🔐 Secure Authentication**: JWT-based auth with secure cookie handling.
- **📊 Interactive Dashboard**: Real-time project tracking and visualization.
- **📱 Responsive Design**: Fully responsive UI using Chakra UI and Tailwind CSS.
- **⚡ High Performance**: Powered by Next.js 16 App Router and Server Components.
- **💾 Data Persistence**: MongoDB with Mongoose for robust data modeling.
- **🎨 Modern UI/UX**: Framer Motion animations and polished components.
- **🛠️ Type Safety**: Full TypeScript support across the entire stack.

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [Chakra UI v3](https://chakra-ui.com/) & [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query) (React Query)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) Validation
- **Icons**: [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

### Backend

- **Database**: [MongoDB](https://www.mongodb.com/)
- **ODM**: [Mongoose](https://mongoosejs.com/)
- **Authentication**: JWT (JSON Web Tokens) & [Bcrypt](https://github.com/dcodeIO/bcrypt.js)
- **API**: Next.js API Routes

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) URI (Local or Atlas)

### 📦 Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/projectmanagement.git
    cd projectmanagement
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory. You can copy the example file:

    ```bash
    cp .env.example .env
    ```

    Update `.env` with your credentials:

    ```env
    MONGODB_URI=your_mongodb_connection_string
    JWT_KEY=your_secure_random_secre_key
    NEXT_PUBLIC_API_URL=http://localhost:3000
    ```

4.  **Run the development server**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📂 Project Structure

```bash
├── app/                  # Next.js App Router pages & layouts
│   ├── (auth)/           # Authentication routes (login/signup)
│   ├── api/              # Backend API endpoints
│   ├── dashboard/        # Main dashboard application pages
│   └── layout.tsx        # Root layout configuration
├── components/           # Reusable UI components
├── hooks/                # Custom React hooks (e.g., useCurrentUser)
├── lib/                  # Utilities (axios, database connection)
├── public/               # Static assets
└── ...config files
```

## 🚀 Deployment

The project is optimized for deployment on [Vercel](https://vercel.com/app).

1.  Push your code to a Git repository.
2.  Import the project into Vercel.
3.  Add the Environment Variables (from your `.env`) in the Vercel project settings.
    - **IMPORTANT**: Set `NEXT_PUBLIC_API_URL` to your production domain (e.g., `https://your-app.vercel.app`).
4.  Deploy!

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
