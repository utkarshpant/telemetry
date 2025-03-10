import { Story } from '@prisma/client';
import { type LoaderFunction, json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { prisma } from 'prisma/db.server';
import { getLocaleDateString, getReadingTime } from 'utils/utils';
import InfoIcon from '~/assets/info-icon';
import { validateRequestAndReturnSession } from '~/auth/utils.server';
import { Chip } from '~/components/Chip/Chip';

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

export default function Index() {
	const stories = useLoaderData<Story[]>();
	return (
		<>
			{stories.map((story) => {
				const publishDelta = Date.now() - Date.parse(story.publishedAt as string);
				const daysSincePublished = Math.floor(publishDelta / (1000 * 60 * 60 * 24));
				return (
					<div
						key={story.id}
						className='flex flex-col gap-1 overflow-scroll no-scrollbar'
					>
						<span className='text-2xl tracking-tight flex flex-row flex-wrap gap-1'>
							<Link to={`/story/${story.id}`} className='underline'>{story.title}</Link>
                            {daysSincePublished < 4 ? (
								<Chip content='New!' variant='announcement' />
							) : null}
							{!story.isPublished ? (
								<Chip content='Draft' variant='alert' />
							) : null}
						</span>
						<span className='text-sm text-stone-600 dark:text-stone-400 flex items-center border-b border-b-stone-400 dark:border-b-stone-600 pb-2 gap-2'>
							{story.isPublished
								? `Published on ${getLocaleDateString(
										story.publishedAt as string
								  )}.`
								: `Created on ${getLocaleDateString(story.createdAt)}.`}
							{/* <span>{'•'}</span> */}
                            <p>{getReadingTime(story.wordCount)} minute read.</p>
						</span>

						<p className='text-lg'>{story.subtitle}</p>
					</div>
				);
			})}
		</>
	);
}
