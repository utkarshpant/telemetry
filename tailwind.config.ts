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
			},
		},
	},
	plugins: [],
} satisfies Config;
