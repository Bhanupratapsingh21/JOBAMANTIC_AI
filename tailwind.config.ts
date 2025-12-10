import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            // Remove or comment out any color definitions using lab()
        },
    },
    plugins: [],
    // Add this to force RGB color output
    future: {
        hoverOnlyWhenSupported: true,
    },
};

export default config;