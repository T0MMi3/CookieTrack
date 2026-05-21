/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./public/**/*.{html,js}', './public/404.html'],
  theme: {
    extend: {
      colors: {
        'green': '#1a9988',
        'green-light': '#48ada0',
        'green-super-light': "#8dccc4",
        'green-dark': '#157a6d',
        'orange': '#eb5600',
        'orange-light': '#ef7833',
        'orange-dark': '#bc4500',
        'white': '#ffffff',
        'off-white': '#d9d9d9',
        'white-overlay': 'rgba(255,255,255,0.6)',
        'black-overlay': 'rgba(52,52,52,0.6)',
        'loading-overlay': 'rgba(0,0,0,0.25)',
        'black': '#343434',
        'black-light': '#4d4d4d',
        'gray': '#D1D5DB',
        'gray-light': '#a7aaaf',
        'red': '#d53d3d',
        'red-light': '#e27777',
        'blue': '#1A6A99',
        'blue-light': '#5f97b8'
      },
      fontFamily: {
        sans: ['Lilita One', 'sans-serif']
      },
      borderRadius: {
        'default': '8px'
      },
      boxShadow: {
        'default': '0 3px 6px #00000029, 0 3px 6px #0000003b'
      },
      backgroundImage: {
        'main-bg': "url('/resources/images/main-bg.png')"
      }
    }
  },
  plugins: [],
}