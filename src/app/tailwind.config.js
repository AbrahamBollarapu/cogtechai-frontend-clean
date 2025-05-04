/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/**/*.{js,ts,jsx,tsx}', // ✅ Scan all inside /src
      './node_modules/@clerk/**/*.{js,ts,jsx,tsx}', // ✅ Scan Clerk components for styling
    ],
    theme: {
      extend: {
        colors: {
          primary: '#2563eb', // You can adjust CogTechAI primary color here if needed
        },
      },
    },
    darkMode: 'class', // ✅ Enable dark mode manually (class-based)
    plugins: [],
  }
  