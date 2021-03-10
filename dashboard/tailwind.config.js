module.exports = {
  purge: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        blue: {
          900: '#000416',
          800: '#132050',
          700: '#1b295c',
          600: '#223166',
          500: '#28386e',
          400: '#475380',
          300: '#656f94',
          200: '#8e96b3',
          100: '#babfd2'
        },
        'light-blue': {
          900: '#066a76',
          800: '#168da3',
          700: '#1ea1bc',
          600: '#27b6d8',
          500: '#2cc6ec',
          400: '#3acff1',
          300: '#59d8f6',
          200: '#88e4fa',
          100: '#b7eefc'
        }
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
