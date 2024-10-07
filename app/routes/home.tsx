import { type LoaderFunction } from '@remix-run/node';
import { redirect, useFetcher } from '@remix-run/react';
import { validateRequestAndReturnSession } from '~/auth/utils.server';
import useUser from '~/hooks/useUser';
import { SignOut } from './_auth.sign-out';

export const loader: LoaderFunction = async ({ request }) => {
	const session = await validateRequestAndReturnSession(request);
	if (!session) {
		return redirect('/sign-in', 302);
	} else {
		return null;
	}
};

export default function Home() {
	const { user } = useUser();
    const fetcher = useFetcher();
	return (
		<div className='p-12 w-full h-screen flex flex-col'>
			<div className='flex flex-row w-full gap-2'>
				<h1>Welcome back, {user && user.firstName}!</h1>
				<SignOut />
			</div>
			<button className='px-4 py-2 bg-sky-900 rounded w-60 text-base absolute bottom-4 right-4 z-50' onClick={() => {
                fetcher.submit(null, {
                    method: 'POST',
                    action: '/story/new',
                });
            }}>
				Start your own story.
			</button>
		</div>
	);
}
