import type { Config } from 'tailwindcss';

export default {
	content: ['./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				sans: [
					'"Supreme"',
					'ui-sans-serif',
					'system-ui',
					'sans-serif',
					'"Apple Color Emoji"',
					'"Segoe UI Emoji"',
					'"Segoe UI Symbol"',
					'"Noto Color Emoji"',
				],
				serif: ['Erode'],
				heading: ['Tanker', 'sans-serif'],
				code: ['JetBrains Mono', 'serif'],
			},
			animation: {
        "fade-in": "fade-in 2s ease-in-out",
		blob: "blob 8s infinite cubic-bezier(0.2, -0.68, 0.78, 0.048)",
		'blob-reverse': "blob 8s infinite cubic-bezier(0.615, 0.48, 0.78, 0.048) reverse"
      },
			keyframes: {
				'fade-in': {
					'0%': {
						opacity: '0',
					},
					'100%': {
						opacity: '1',
					},
				},
				blob: {
					'0%': {
						translate: '0 0',
						rotate: '0deg',
					},
					"30%": {
						rotate: '40deg',
					},
					'50%': {
						transform: "translate(5px, 15px) scale(1.1)"
					},
					"80%": {
						rotate: '90deg',
					}
				}
			},
		},
	},
	plugins: [],
} satisfies Config;
