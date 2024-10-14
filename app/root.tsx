import { json, Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';

import stylesheet from './tailwind.css?url';
import { validateRequestAndReturnSession } from './auth/utils.server';
import { User } from '@prisma/client';

export const links: LinksFunction = () => [
	{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
	{
		rel: 'preconnect',
		href: 'https://fonts.gstatic.com',
		crossOrigin: 'anonymous',
	},
	{
		rel: 'stylesheet',
		href: 'https://api.fontshare.com/v2/css?f[]=tanker@400&f[]=erode@1,2&f[]=supreme@1,2&display=swap',
	},
	{
		rel: 'stylesheet',
		href: stylesheet,
	},
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const session = await validateRequestAndReturnSession(request);
	return json({
		user: session?.has('user') ? (session.get('user') as User) : null,
		signedIn: session ? true : false,
	});
};

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
