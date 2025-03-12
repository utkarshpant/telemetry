import { Story } from '@prisma/client';
import { type LoaderFunction, json } from '@remix-run/node';
import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import { prisma } from 'prisma/db.server';
import { getLocaleDateString, getReadingTime } from 'utils/utils';
import InfoIcon from '~/assets/info-icon';
import { validateRequestAndReturnSession } from '~/auth/utils.server';
import { Chip } from '~/components/Chip/Chip';
import DeleteIcon from '~/assets/delete-material-icon.svg';

export const loader: LoaderFunction = async ({ request }) => {
	const session = await validateRequestAndReturnSession(request);
	if (session) {
		const stories = await prisma.story.findMany({
			where: {
				authors: {
					some: {
						userId: session.get('userId'),
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
		return json(stories);
	}
};

export type StoryCardProps = { story: Story };

function StoryCard({ story }: StoryCardProps) {
	const publishDelta = Date.now() - Date.parse(story.publishedAt as string);
	const daysSincePublished = Math.floor(publishDelta / (1000 * 60 * 60 * 24));
	const fetcher = useFetcher({ key: 'delete' });
	return (
		<div
			key={story.id}
			className='flex flex-col gap-1 overflow-scroll no-scrollbar'
		>
			<span className='text-base font-medium tracking-tight flex flex-row gap-1 items-center flex-wrap'>
				<Link
					to={`/story/${story.id}`}
					className='hover:underline'
				>
					{story.title}
				</Link>
				{daysSincePublished < 4 ? (
					<Chip
						content='New!'
						variant='announcement'
					/>
				) : null}
				{!story.isPublished ? (
					<Chip
						content='Draft'
						variant='info'
					/>
				) : null}
			</span>
			<p className='text-base text-stone-400 font-light'>{story.subtitle}</p>
			<span className='text-xs text-stone-600 dark:text-stone-400 border-b border-b-stone-400 dark:border-b-stone-600 pb-2 flex flex-row gap-1 flex-wrap items-center'>
				{story.isPublished
					? `Published on ${getLocaleDateString(story.publishedAt as string)}.`
					: `Created on ${getLocaleDateString(story.createdAt)}.`}
				{/* <span>{'•'}</span> */}
				<span>{getReadingTime(story.wordCount)} minute read.</span>
				<Chip
					icon={DeleteIcon}
					variant='alert'
					content='Delete'
					onClick={() => {
						fetcher.submit(null, {
							action: `/api/story/${story.id}/update`,
							method: 'DELETE',
						});
					}}
				/>
			</span>
		</div>
	);
}

export default function Index() {
	const stories = useLoaderData<Story[]>();
	return (
		<div className='flex flex-col gap-4'>
			{stories.length > 0
				? stories.map((story) => (
						<StoryCard
							key={story.id}
							story={story}
						/>
				  ))
				: (
					<div className='w-full flex flex-row items-center text-sm dark:text-stone-500 text-stone-400 justify-center h-[56vh] select-none'>
						Looks a little empty here...  &nbsp;<Link to={'/story/new'} className='hover:underline'>Start a new story!</Link>
					</div>
				)}
		</div>
	);
}
