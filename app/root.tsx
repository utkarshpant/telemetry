import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import type { LinksFunction, LoaderFunction } from '@remix-run/node';

import stylesheet from './tailwind.css?url';
import { validateRequestAndReturnSession } from './auth/utils.server';

export const links: LinksFunction = () => [
	{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
	{
		rel: 'preconnect',
		href: 'https://fonts.gstatic.com',
		crossOrigin: 'anonymous',
	},
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
	},
	{
		rel: 'stylesheet',
		href: 'https://api.fontshare.com/v2/css?f[]=tanker@400&f[]=erode@1,2&display=swap',
	},
	{
		rel: 'stylesheet',
		href: stylesheet,
	},
];

export const loader: LoaderFunction = async ({ request }) => {
	const session = await validateRequestAndReturnSession(request);
	if (session) {
		return {
			user: session.get('user'),
			signedIn: true,
		}
	} else {
		return {
			user: null,
			signedIn: false,
		}
	}
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en'>
			<head>
				<meta charSet='utf-8' />
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1'
				/>
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}
