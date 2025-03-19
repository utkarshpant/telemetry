/* eslint-disable react/no-children-prop */
/* eslint-disable no-mixed-spaces-and-tabs */
import { validateRequestAndReturnSession } from '~/auth/utils.server';
import { prisma } from 'prisma/db.server';
import { json, MetaFunction, type LoaderFunctionArgs } from '@remix-run/node';
import { isRouteErrorResponse, Link, useLoaderData, useRouteError } from '@remix-run/react';
import { type Story } from '@prisma/client';
import LexicalEditor from './../components/Editor/LexicalEditor';
import { usePartySocket } from 'partysocket/react';
import Header from '~/components/Header/Header';
import { RandomStoryBackgroundErrorBoundary } from '~/components/RandomStoryBackground';

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

const getAuthorsString = (authors: StoryLoaderData['story']['authors']) => {
	return authors
		.map((author) => `${author.user.firstName} ${author.user.lastName ?? ''}`.trim())
		.join(', ');
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: data?.story.title + ' | ' + data?.story.authors[0].user.firstName },
		{
			property: 'og:title',
			content:
				data?.story.title +
				' | ' +
				(data?.story.authors ? getAuthorsString(data.story.authors) : ''),
		},
		{
			name: 'description',
			content: data?.story.subtitle,
		},
		{
			property: 'og:type',
			content: 'article',
		},
		{
			property: 'og:description',
			content: data?.story.subtitle,
		},
		{
			property: 'og:url',
			content: `https://telemetry.blog/story/${data?.story.id}`,
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
				!story.authors.some((author) => author.userId === session.get('userId'))) &&
			!story.isPublished
		) {
			throw new Response("Sorry, we couldn't find that story.", { status: 404 });
		}

		const totalViews = await prisma.storyViews.aggregate({
			where: {
				storyId: Number(storyId),
			},
			_count: {
				_all: true,
			},
		});
		if (
			!session?.has('userId') ||
			!story.authors.some((author) => author.userId === session.get('userId'))
		) {
			prisma.storyViews
				.create({
					data: {
						storyId: Number(storyId),
						date: new Date(),
					},
				})
				.catch((e) => {
					console.error(e);
				});
		}
		return json({
			story,
			totalViews: totalViews._count._all ?? 0,
			allowEdits: story.authors.some((author) => author.userId === session?.get('userId')),
		});
	} catch {
		throw new Response("Sorry, we couldn't find that story.", { status: 404 });
	}
};

export default function Story() {
	const { story } = useLoaderData<StoryLoaderData>();
	usePartySocket({
		host: 'https://telemetry-party.utkarshpant.partykit.dev',
		party: 'story',
		room: String(story.id),
	});
	return (
		<>
			<Header />
			<LexicalEditor></LexicalEditor>
		</>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();
	if (isRouteErrorResponse(error)) {
		return (
			<RandomStoryBackgroundErrorBoundary>
			<div className='p-12 bg-neutral-950 bg-opacity-80 h-screen w-screen z-0'>
				<h1 className='text-6xl'>
					{error.status} {error.statusText}
				</h1>
				<p className='my-4'>{error.data}</p>
				<p>Head over to <Link to='/' className='underline'>the home page</Link> to check out what Telemetry members are writing, or even <Link to='/sign-up' className='underline'>sign-up</Link> yourself!</p>
			</div>
			</RandomStoryBackgroundErrorBoundary>
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