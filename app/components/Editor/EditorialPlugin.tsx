import { useFetcher, useLoaderData } from '@remix-run/react';
import { loader } from '~/routes/story_.$storyId';
import InfoIcon from '../../assets/info-material-icon.svg?url'; // Adjust the path as necessary
import VisibilityIcon from '../../assets/visibility-material-icon.svg?url'; // Adjust the path as necessary
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useState } from 'react';
import SignedIn from '../SignedIn';
import SignedOut from '../SignedOut';

export default function EditorialPlugin() {
	const loaderData = useLoaderData<typeof loader>();
	const editDateString = new Date(loaderData.story.updatedAt).toLocaleDateString();
	const editTimeString = new Date(loaderData.story.updatedAt).toLocaleTimeString();
	const publishDateString =
		loaderData.story.isPublished && loaderData.story.publishedAt
			? new Date(loaderData.story.publishedAt).toLocaleDateString()
			: null;
	const [editor] = useLexicalComposerContext();
	const [editable, setEditable] = useState(false);
	const fetcher = useFetcher();
	const readingTime = loaderData.story.wordCount / 200;

	useEffect(() => {
		return editor.registerEditableListener((editable) => {
			setEditable(editable);
		});
	});

	return (
		<div
			className={
				'animate-fade-in md:px-8 md:py-8 p-4 flex flex-col gap-4 md:pl-12 w-full min-h-full font-sans transition-all'
			}
			// unused border classes: border-t border-t-black dark:border-t-white md:border-t-transparent md:border-l md:border-l-black md:dark:border-l-white md:dark:border-t-transparent
		>
			<div className='text-lg font-medium'>Editorial</div>
			<div className='flex flex-col gap-4'>
				<span className='flex flex-row gap-2 items-center text-sm'>
					<img
						src={InfoIcon}
						alt='Info'
						className='h-4'
					></img>
					<span>
						This story was last saved on <strong>{editDateString}</strong> at{' '}
						<strong>{editTimeString}</strong>.
					</span>
				</span>
				{loaderData.story.isPublished ? (
					<span className='flex flex-row gap-2 items-center text-sm'>
						<img
							src={InfoIcon}
							alt='Info'
							className='h-4'
						></img>
						<span>
							This story was published on <strong>{publishDateString}</strong>.
						</span>
					</span>
				) : null}
				<span className='flex flex-row gap-2 items-center text-sm'>
					<img
						src={InfoIcon}
						alt='Info'
						className='h-4'
					></img>
					<span>
						Estimated reading time:{' '}
						{readingTime < 1 ? (
							<strong>less than a minute</strong>
						) : (
							<strong>{readingTime} minutes</strong>
						)}
						&nbsp;({loaderData.story.wordCount} words).
					</span>
				</span>
				<span className='flex flex-row gap-2 items-center text-sm'>
					<img
						src={VisibilityIcon}
						alt='Info'
						className='h-4'
					></img>
					<span>
						<strong>{loaderData.totalViews < 1 ? "No views so far." : `${loaderData.totalViews} views`}</strong>
						<SignedIn>&nbsp;(Your own views are not counted!)</SignedIn>
					</span>
				</span>
				<SignedIn>
					<button
						type='button'
						className={`w-full md:w-56 px-4 py-2 rounded transition-colors ${
							editor.isEditable() ? 'bg-neutral-800' : 'bg-sky-800'
						} text-white`}
						onClick={() => {
							editor.update(() => {
								editor.setEditable(!editor.isEditable());
							});
						}}
					>
						{editable ? (
							<div className='flex flex-row items-baseline gap-2 justify-center'>
								<svg
									width='10'
									height='10'
									xmlns='http://www.w3.org/2000/svg'
								>
									<circle
										cx='5'
										cy='5'
										r='5'
										fill='#16a34a'
										className='animate-pulse'
									></circle>
								</svg>
								<span>You&apos;re editing this story</span>
							</div>
						) : (
							'Edit this story'
						)}
					</button>
					<button
						type='button'
						title='publish'
						className={`w-full md:w-56 px-4 py-2 transition-all justify-center ${
							loaderData.story.isPublished ? 'bg-orange-600' : 'bg-green-600'
						} text-white rounded`}
						onClick={() => {
							if (editable) {
								editor.update(() => {
									editor.setEditable(false);
								});
							}
							const formData = new FormData();
							formData.append('isPublished', String(!loaderData.story.isPublished));
							fetcher.submit(formData, {
								method: 'POST',
								action: `/api/story/${loaderData.story.id}/update`,
							});
						}}
					>
						{fetcher.state !== 'idle'
							? 'Working...'
							: loaderData.story.isPublished
							? 'Unpublish'
							: 'Publish'}
					</button>
					<hr className='mt-2' />
					<a
						href='/home'
						className='hover:underline'
					>
						Back to your stories...
					</a>
				</SignedIn>
				<SignedOut>
				<hr />
					<a
						href={`/user/${loaderData.story.authors[0].user.username}`}
						className='hover:underline'
					>
						More stories by {loaderData.story.authors[0].user.firstName}...
					</a>
				</SignedOut>
			</div>
		</div>
	);
}
