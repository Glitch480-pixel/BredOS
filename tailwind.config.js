/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        xp: ['Tahoma', 'Trebuchet MS', 'Segoe UI', 'Verdana', 'sans-serif'],
      },
      colors: {
        bred: {
          crust: '#5a3418',
          crustlight: '#8a5a2b',
          crumb: '#e8c07d',
          toast: '#c97b34',
          amber: '#e2711d',
          burnt: '#3e2110',
          cream: '#fff4de',
        },
      },
      boxShadow: {
        xpwin: '2px 2px 10px rgba(0,0,0,0.55)',
      },
    },
  },
  plugins: [],
}
