import { type ActionFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json, useFetcher } from '@remix-run/react';
import { validateRequestAndReturnSession, destroySession } from '~/auth/utils.server';

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
			type='button'
			className='underline text-white'
			onClick={() => {
				signOutFetcher.submit(null, {
					method: 'post',
					action: '/sign-out',
				});
			}}
		>
			{signOutFetcher.state === 'submitting' ? 'Signing you out...' : 'Sign out.'}
		</button>
	);
}
