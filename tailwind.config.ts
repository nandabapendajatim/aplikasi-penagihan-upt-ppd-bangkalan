import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["corporate"]
  }
}   