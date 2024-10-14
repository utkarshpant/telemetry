/* eslint-disable react/no-children-prop */
/* eslint-disable no-mixed-spaces-and-tabs */
import { validateRequestAndReturnSession } from '~/auth/utils.server';
import { prisma } from 'prisma/db.server';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { isRouteErrorResponse, useLoaderData, useRouteError } from '@remix-run/react';
import { type Story } from '@prisma/client';
import LexicalEditor from './../components/Editor/LexicalEditor';

export type StoryLoaderData = {
	story: Story & {
		authors: {
			userId: number;
			user: {
				username: string;
				bio: string;
				firstName: string;
				lastName: string;
				profilePictureUrl: string;
			};
		}[];
	};
	allowEdits: boolean;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const session = await validateRequestAndReturnSession(request);
	const { storyId } = params;
	try {
		const story = await prisma.story.findUniqueOrThrow({
			where: {
				id: Number(storyId),
			},
			include: {
				authors: {
					select: {
						userId: true,
						user: {
							select: {
								username: true,
								bio: true,
								firstName: true,
								lastName: true,
								profilePictureUrl: true,
							},
						},
					},
				},
			},
		});
		return json({
			story,
			allowEdits: story.authors.some((author) => author.userId === session?.get('userId')),
		});
	} catch {
		throw new Response("Sorry, we couldn't find that story.", { status: 404 });
	}
};

export default function Story() {
	return (
		<div className={`w-full min-h-screen flex flex-col md:flex-row gap-4 md:py-12 pt-4 md:px-12 relative justify-between`}>
			<LexicalEditor></LexicalEditor>
		</div>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();

	if (isRouteErrorResponse(error)) {
		return (
			<div className='p-12'>
				<h1 className='text-6xl'>
					{error.status} {error.statusText}
				</h1>
				<p className='my-2'>{error.data}</p>
			</div>
		);
	} else if (error instanceof Error) {
		return (
			<div>
				<h1>Error</h1>
				<p>{error.message}</p>
				<p>The stack trace is:</p>
				<pre>{error.stack}</pre>
			</div>
		);
	} else {
		return <h1>Unknown Error</h1>;
	}
}
