import { type ActionFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json, useFetcher } from '@remix-run/react';
import { validateRequestAndReturnSession, destroySession } from '~/auth/utils.server';
import LogoutIcon from '../assets/logout-material-icon.svg?url';

export const action: ActionFunction = async ({ request }) => {
	const session = await validateRequestAndReturnSession(request);
	if (session) {
		return redirect('/sign-in', {
			headers: {
				'Set-Cookie': await destroySession(session),
			},
		});
	}
	return json(
		{
			message: 'You are not signed in.',
		},
		{
			status: 400,
		}
	);
};

export function SignOut() {
	const signOutFetcher = useFetcher({ key: 'sign-out' });
	return (
		<button
			className='w-full md:w-52 bg-sky-900 hover:bg-sky-800 py-2 px-4 rounded text-white items-center justify-center flex flex-row gap-2'
			onClick={() => {
				signOutFetcher.submit(null, {
					method: 'post',
					action: '/sign-out',
				});
			}}
		>
			<img
				src={LogoutIcon}
				className='h-4'
				alt='Logout icon'
			/>{' '}
			{signOutFetcher.state === 'submitting' ? 'Signing you out...' : 'Sign out'}
		</button>
	);
}
