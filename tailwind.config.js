// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // หรือ "./app/**/*" ถ้าใช้ App Router
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-prompt)', 'sans-serif'], // ใช้ Prompt เป็นหลัก
      },
    },
  },
  plugins: [],
}
