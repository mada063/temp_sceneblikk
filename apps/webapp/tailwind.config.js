/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'media', // Use prefers-color-scheme for dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'custom-color': {
          50: '#f0f8ff',
          100: '#e0f0fe',
          200: '#bae2fd',
          300: '#37b4f9',
          400: '#0c9aeb',
          500: '#0179c8',
          600: '#0261a2',
          700: '#065286',
          800: '#0a3d62',
          900: '#082c49',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-out': 'fadeOut 0.25s ease-out forwards',
        'slide-up-bounce': 'slideUpBounce 0.42s cubic-bezier(0.68, -0.45, 0.265, 1.45) forwards',
        'cloud-fade-in': 'cloudFadeIn 1s ease-out forwards',
        'clock-slide-up': 'clockSlideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        'calendar-cell-fade-in': 'calendarCellFadeIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        'calendar-today-pulse': 'calendarTodayPulse 2s ease-in-out infinite',
        'calendar-event-fade-in': 'calendarEventFadeIn 0.3s ease-out forwards',
        'news-scroll-horizontal-tiny': 'newsScrollHorizontal 20s linear infinite',
        'news-scroll-horizontal-small': 'newsScrollHorizontal 25s linear infinite',
        'news-scroll-medium': 'newsScrollUp 30s linear infinite',
        'news-scroll-large': 'newsScrollUp 35s linear infinite',
        'news-scroll-xlarge': 'newsScrollUp 40s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeOut: {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        slideUpBounce: {
          '0%': { opacity: '0', transform: 'translate3d(0, 100%, 0)' },
          '55%': { opacity: '1', transform: 'translate3d(0, -4%, 0)' },
          '78%': { transform: 'translate3d(0, 1.5%, 0)' },
          '100%': { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        cloudFadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        clockSlideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0.4' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        calendarCellFadeIn: {
          '0%': { opacity: '0', transform: 'translateY(50%)' },
          '60%': { opacity: '1', transform: 'translateY(-5%)' },
          '80%': { transform: 'translateY(2%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        calendarTodayPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
        },
        calendarEventFadeIn: {
          '0%': { opacity: '0', transform: 'translateX(-5px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        newsScrollUp: {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(-50%)' },
        },
        newsScrollHorizontal: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}

