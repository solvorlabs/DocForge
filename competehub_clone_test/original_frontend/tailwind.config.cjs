/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          500: '#667eea',
          600: '#5a6fd8',
          700: '#4f5fc5',
        },
        secondary: {
          500: '#764ba2',
          600: '#6a4292',
        }
      },
      // fontFamily: {
      //   sans: ['Inter', 'system-ui', 'sans-serif'],
      // },
      boxShadow: {
        'custom': '0 10px 30px rgba(0, 0, 0, 0.1)',
        'custom-hover': '0 20px 40px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}

