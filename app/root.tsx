import { isRouteErrorResponse, json, Links, Meta, Outlet, redirect, Scripts, ScrollRestoration, useRouteError } from '@remix-run/react';
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';

import stylesheet from './tailwind.css?url';
import { destroySession, validateRequestAndReturnSession } from './auth/utils.server';
import { User } from '@prisma/client';

// import Header from './components/Header/Header';

export const links: LinksFunction = () => [
	{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
	{
		rel: 'preconnect',
		href: 'https://fonts.gstatic.com',
		crossOrigin: 'anonymous',
	},
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono&display=swap',
	},
	{
		rel: 'stylesheet',
		href: 'https://api.fontshare.com/v2/css?f[]=sentient@1,2&display=swap',
	},
	{
		rel: 'stylesheet',
		href: stylesheet,
	},
	{
		rel: 'icon',
		href: '/favicon.png',
	},
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const session = await validateRequestAndReturnSession(request);
	if (session) {
		if (
			session.get('status') !== 'ACTIVE' ||
			(session.get('expiresAt') && new Date(session.get('expiresAt').toDateString())) <
				new Date()
		) {
			return redirect('/sign-in', {
				headers: { 'Set-Cookie': await destroySession(session) },
			});
		}
	}
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
				{/* <Header /> */}
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

export function ErrorBoundary() {
	const error = useRouteError();
	if (isRouteErrorResponse(error)) {
		return (
			<div className='p-12'>
				<h1 className='text-6xl'>Sorry, we couldn&apos;t find that page.</h1>
			</div>
		);
	}
	return <h1>Sorry, something went wrong. {JSON.stringify(error)}</h1>;
}