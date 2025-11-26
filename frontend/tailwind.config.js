/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F5F5F7", // Apple light gray background
        surface: {
          DEFAULT: "#FFFFFF",
          hover: "#F5F5F7",
        },
        primary: {
          DEFAULT: "#0071e3", // Apple blue
          hover: "#0077ED",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#86868b", // Apple gray
          foreground: "#FFFFFF",
        },
        text: {
          primary: "#1d1d1f", // Apple dark gray
          secondary: "#86868b",
        },
        border: "#d2d2d7",
        ai: {
          blue: "#0071e3",
          purple: "#9F55FF",
          pink: "#FF3385",
          cyan: "#00E5FF",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(0, 113, 227, 0.15)',
        'ai-glow': '0 0 30px rgba(159, 85, 255, 0.3)',
      },
      backgroundImage: {
        'ai-gradient': 'linear-gradient(135deg, #0071e3 0%, #9F55FF 50%, #FF3385 100%)',
        'ai-mesh': 'radial-gradient(at 0% 0%, rgba(0, 113, 227, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(159, 85, 255, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(255, 51, 133, 0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(0, 229, 255, 0.15) 0px, transparent 50%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'mesh-flow': 'mesh-flow 20s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(159, 85, 255, 0.3)' },
          '50%': { opacity: '.8', boxShadow: '0 0 30px rgba(0, 113, 227, 0.4)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'mesh-flow': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        }
      }
    },
  },
  plugins: [],
}
