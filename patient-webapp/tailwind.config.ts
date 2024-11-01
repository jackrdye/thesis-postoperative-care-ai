import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import flowbite from "flowbite-react/tailwind";

export default {
  content: ["./src/**/*.tsx", flowbite.content()],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
    },
  },
  plugins: [flowbite.plugin()],
} satisfies Config;
