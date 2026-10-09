/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],

  theme: {
    extend: {
      /* ======================================================
                            COLORS
      ====================================================== */

      colors: {
        ink: "#1F1535",

        "ink-soft": "#6B6570",

        paper: "#FBF8F2",

        purple: {
          900: "#3D0020",
          700: "#7B0040",
          600: "#8F0049",
          100: "#F5D6E4",
          50: "#FAF0F5",
        },

        gold: {
          DEFAULT: "#F5C518",
          dark: "#B08A00",
        },

        coral: "#FF6B6B",
      },

      /* ======================================================
                          TYPOGRAPHY
      ====================================================== */

      fontFamily: {
        display: [
          "Manrope",
          "sans-serif",
        ],

        body: [
          "Manrope",
          "sans-serif",
        ],

        mono: [
          '"Space Mono"',
          "monospace",
        ],
      },

      /* ======================================================
                          ANIMATIONS
      ====================================================== */

      keyframes: {
        marquee: {
          "0%": {
            transform: "translateX(0)",
          },

          "100%": {
            transform: "translateX(-50%)",
          },
        },

        floatY: {
          "0%, 100%": {
            transform: "translateY(0)",
          },

          "50%": {
            transform: "translateY(-10px)",
          },
        },
      },

      animation: {
        marquee:
          "marquee 22s linear infinite",

        floatY:
          "floatY 4s ease-in-out infinite",
      },
    },
  },

  plugins: [],
};