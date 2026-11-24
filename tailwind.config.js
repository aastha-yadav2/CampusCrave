/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF5EC',
          100: '#FFE7D3',
          200: '#FFCEAA',
          300: '#FFAF75',
          400: '#FF8A3D',
          500: '#FC8019', // Primary Swiggy/Campus Crave orange
          600: '#E66E07',
          700: '#C25700',
          800: '#9B4404',
          900: '#7D3908',
        },
        cream: {
          50: '#FFFCF9',
          100: '#FFF8F2', // Warm background
          200: '#FDF2E8',
          300: '#F6E5D5',
        },
        charcoal: {
          900: '#1E1B18',
          800: '#242424', // Dark primary text
          700: '#3D3833',
          600: '#5A534D',
          500: '#77716C', // Secondary text
          400: '#A49D96',
          300: '#D5CEC8',
          200: '#EAE5E0',
          100: '#F5F2EF',
        },
        success: {
          DEFAULT: '#2F9D5C',
          light: '#EAF8EF',
          dark: '#1F7040',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 10px rgba(45, 30, 15, 0.04), 0 1px 3px rgba(45, 30, 15, 0.03)',
        'card-hover': '0 12px 28px rgba(45, 30, 15, 0.09), 0 4px 10px rgba(45, 30, 15, 0.04)',
        'modal': '0 25px 60px -15px rgba(33, 20, 10, 0.25)',
      }
    },
  },
  plugins: [],
}
