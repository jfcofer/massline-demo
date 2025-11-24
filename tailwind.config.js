/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1E40AF',
          light: '#60A5FA',
        },
        // Secondary Colors
        secondary: {
          DEFAULT: '#10B981',
          dark: '#059669',
          light: '#34D399',
        },
        // Status Colors
        success: {
          DEFAULT: '#10B981',
          bg: '#D1FAE5',
          border: '#6EE7B7',
        },
        error: {
          DEFAULT: '#EF4444',
          bg: '#FEE2E2',
          border: '#FCA5A5',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: '#FEF3C7',
          border: '#FCD34D',
        },
        info: {
          DEFAULT: '#3B82F6',
          bg: '#DBEAFE',
          border: '#93C5FD',
        },
        // Neutral Colors
        bg: {
          primary: '#FFFFFF',
          secondary: '#F9FAFB',
          tertiary: '#F3F4F6',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#FFFFFF',
        },
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          tertiary: '#9CA3AF',
          disabled: '#D1D5DB',
        },
        border: {
          light: '#E5E7EB',
          medium: '#D1D5DB',
          dark: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'sans-serif'],
        mono: ['Roboto Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        // Mobile scale
        'h1': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'h2': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'h3': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'h4': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'h5': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'h6': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'body-large': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-small': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'button': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'overline': ['11px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.5px' }],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
      },
      borderRadius: {
        'button-mobile': '16px',
        'button-web': '12px',
        'card-mobile': '16px',
        'card-web': '12px',
        'input': '12px',
        'badge': '12px',
      },
      boxShadow: {
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'fab': '0 12px 20px -5px rgba(37, 99, 235, 0.3), 0 8px 16px -8px rgba(0, 0, 0, 0.2)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '350ms',
      },
      transitionTimingFunction: {
        'default': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        'decelerate': 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        'accelerate': 'cubic-bezier(0.4, 0.0, 1, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
