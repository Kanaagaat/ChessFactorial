/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FDFDFB', // cream
        surface: '#F4F1EA',    // soft beige cards
        primary: {
          DEFAULT: '#2E7D32',  // forest green
          hover: '#256529',
          active: '#1D5020',
        },
        danger: {
          DEFAULT: '#BF360C',  // deep orange
          hover: '#A32D0A',
          active: '#872508',
        },
        text: {
          primary: '#101820',  // dark slate
          secondary: '#6D7781', // muted gray
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      spacing: {
        // 8px system is default in tailwind (1 = 0.25rem = 4px, 2 = 8px, 4 = 16px)
      }
    },
  },
  plugins: [],
}
