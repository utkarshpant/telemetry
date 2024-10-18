import { LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect, useFetcher, useLoaderData } from '@remix-run/react';
import { commitSession, validateRequestAndReturnSession } from '~/auth/utils.server';
import Header from '~/components/Header/Header';
import { PrismaClient } from '@prisma/client';

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const session = await validateRequestAndReturnSession(request);
	if (!session) {
		return redirect('/sign-in', 302);
	} else {
		console.log(session.data);
		const userId = session.get('userId');
		const prisma = new PrismaClient();
		const stories = await prisma.story.findMany({
			where: {
				authors: {
					some: {
						userId,
					},
				},
			},
			select: {
				id: true,
				title: true,
				createdAt: true,
				isPublished: true,
				publishedAt: true,
				updatedAt: true,
				wordCount: true,
			},
		});
		return json(
			{
				stories,
				message: session.has('message') ? (session.get('message') as string) : null,
			},
			{
				headers: {
					'Set-Cookie': await commitSession(session),
				},
			}
		);
	}
};

export function NewStoryButton() {
	const fetcher = useFetcher();
	return (
		<button
			className='px-4 py-1 bg-sky-900 rounded w-56 text-base'
			onClick={() => {
				fetcher.submit(null, {
					method: 'POST',
					action: '/story/new',
				});
			}}
		>
			Start a new story
		</button>
	);
}

export default function Home() {
	const loaderData = useLoaderData<typeof loader>();

	return (
		<div className='p-12 w-full h-screen flex flex-col gap-4 mt-12'>
			<Header />
			<div className='min-h-full w-full md:w-2/3 m-auto'>
				{loaderData.message && <div className='w-full p-2 flex flex-row justify-start items-center bg-red-600 text-white'>{loaderData.message}</div>}
				<h1 className='text-2xl'>Your stories</h1>
			</div>
		</div>
	);
}
