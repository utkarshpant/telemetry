/* eslint-disable react/no-children-prop */
/* eslint-disable no-mixed-spaces-and-tabs */
import { validateRequestAndReturnSession } from '~/auth/utils.server';
import { prisma } from 'prisma/db.server';
import { json, MetaFunction, type LoaderFunctionArgs } from '@remix-run/node';
import { isRouteErrorResponse, useRouteError } from '@remix-run/react';
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
	totalViews: number;
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: data?.story.title + ' | ' + data?.story.authors[0].user.firstName },
		{
			property: 'og:title',
			content: data?.story.title + ' | ' + data?.story.authors[0].user.firstName,
		},
		{
			name: 'description',
			content: data?.story.subtitle,
		},
	];
};

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

		if (
			(!session?.has('userId') ||
				story.authors.some((author) => author.userId !== session.get('userId'))) &&
			!story.isPublished
		) {
			throw new Response("Sorry, we couldn't find that story.", { status: 404 });
		}

		const totalViews = await prisma.storyViews.aggregate({
			where: {
				storyId: Number(storyId),
			},
			_sum: {
				count: true,
			},
		});
		if (
			!session?.has('userId') ||
			story.authors.some((author) => author.userId !== session.get('userId'))
		) {
			prisma.storyViews
				.upsert({
					where: {
						storyId_date: {
							storyId: Number(storyId),
							date: new Date(),
						},
					},
					update: {
						count: {
							increment: 1,
						},
					},
					create: {
						storyId: Number(storyId),
						date: new Date(),
						count: 1,
					},
				})
				.catch((e) => {
					console.error(e);
				});
		}
		return json({
			story,
			totalViews: totalViews._sum.count ? totalViews._sum.count + 1 : 0,
			allowEdits: story.authors.some((author) => author.userId === session?.get('userId')),
		});
	} catch {
		throw new Response("Sorry, we couldn't find that story.", { status: 404 });
	}
};

export default function Story() {
	return (
		<div
			className={`w-full min-h-screen flex flex-col md:flex-row gap-4 md:p-12 relative justify-between`}
		>
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
				<p className='my-4'>{error.data}</p>
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
