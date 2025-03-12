import { useFetcher, useLoaderData } from '@remix-run/react';
import { loader } from '~/routes/story_.$storyId';
import EditIcon from '../../assets/edit-material-icon.svg?url'; // Adjust the path as necessary
import InfoIcon from '../../assets/info-material-icon.svg?url'; // Adjust the path as necessary
import VisibilityIcon from '../../assets/visibility-material-icon.svg?url'; // Adjust the path as necessary
import PublishIcon from '../../assets/publish-material-icon.svg?url'; // Adjust the path as necessary
import DeleteIcon from '../../assets/delete-material-icon.svg?url'; // Adjust the path as necessary
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useState } from 'react';
import SignedIn from '../SignedIn';
import SignedOut from '../SignedOut';
import { useDeleteFetcher, useUpdateFetcher } from '~/routes/api.story.$storyId.update';
import useUser from '~/hooks/useUser';

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
	const updateFetcher = useUpdateFetcher();
	const deleteFetcher = useDeleteFetcher();
	const readingTime = loaderData.story.wordCount / 200;
	const { user, signedIn } = useUser();

	useEffect(() => {
		return editor.registerEditableListener((editable) => {
			setEditable(editable);
		});
	});

	const isUserAuthor = signedIn ? loaderData.story.authors.some((author) => author.userId === user?.id) : false;

	return (
		<div
			className={
				'animate-fade-in flex flex-col gap-4 w-full min-h-full font-sans md:text-sm text-base transition-all items-start print:hidden'
			}
			// unused border classes: border-t border-t-black dark:border-t-white md:border-t-transparent md:border-l md:border-l-black md:dark:border-l-white md:dark:border-t-transparent
		>
			<div className='text-2xl md:text-4xl tracking-tight font-medium'>Editorial</div>
			<div className='flex flex-col gap-4'>
				<span className='flex flex-row gap-2 items-center'>
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
					<span className='flex flex-row gap-2 items-center'>
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
				<span className='flex flex-row gap-2 items-center'>
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
				<span className='flex flex-row gap-2 items-center'>
					<img
						src={VisibilityIcon}
						alt='Info'
						className='h-4'
					></img>
					<span>
						<strong>
							{loaderData.totalViews < 1
								? 'No views so far.'
								: `${loaderData.totalViews} views`}
						</strong>
						<SignedIn>&nbsp;(Your own views are not counted!)</SignedIn>
					</span>
				</span>
				<SignedIn>
					{isUserAuthor ? (
						<div className='flex flex-row md:flex-col gap-2 h-min'>
							<button
								type='button'
								className={`w-full px-4 py-2 rounded transition-colors ${
									editor.isEditable()
										? 'bg-neutral-800 hover:bg-neutral-700'
										: 'bg-sky-800 hover:bg-sky-700'
								} text-white`}
								onClick={() => {
									editor.update(() => {
										editor.setEditable(!editor.isEditable());
										editor.focus();
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
										<div className='flex flex-row gap-2 items-center justify-center'>
											{editable ? null : (
												<img
													src={EditIcon}
													alt='Edit'
													className='h-4'
												></img>
											)}
											<span>Editing</span>
										</div>
									</div>
								) : (
									<div className='flex flex-row gap-2 items-center justify-center'>
										<img
											src={EditIcon}
											alt='Edit'
											className='h-4'
										></img>
										<span>Edit</span>
									</div>
								)}
							</button>
							<button
								type='button'
								title='publish'
								className={`w-full px-4 py-2 transition-all justify-center flex flex-row items-center gap-2 ${
									loaderData.story.isPublished
										? 'bg-orange-600 hover:bg-orange-500'
										: 'bg-green-600 hover:bg-green-500'
								} text-white rounded`}
								onClick={() => {
									if (editable) {
										editor.update(() => {
											editor.setEditable(false);
										});
									}
									const formData = new FormData();
									formData.append(
										'isPublished',
										String(!loaderData.story.isPublished)
									);
									updateFetcher.submit(formData, {
										method: 'POST',
										action: `/api/story/${loaderData.story.id}/update`,
									});
								}}
							>
								<img
									src={PublishIcon}
									alt='Publish'
									className='h-4'
								></img>
								{updateFetcher.state !== 'idle'
									? 'Working...'
									: loaderData.story.isPublished
									? 'Unpublish'
									: 'Publish'}
							</button>
							<button
								type='button'
								title='publish'
								className={`w-full px-4 py-2 transition-all justify-center bg-red-600 hover:bg-red-700 font-semibold text-white rounded flex flex-row gap-2 items-center`}
								onClick={() => {
									deleteFetcher.submit(null, {
										action: `/api/story/${loaderData.story.id}/update`,
										method: 'DELETE',
									});
								}}
							>
								<img
									src={DeleteIcon}
									alt='Delete'
									className='h-4'
								></img>
								{deleteFetcher.state !== 'idle'
									? 'Deleting...'
									: 'Delete'}
							</button>
						</div>
					) : null}

					<hr className='mt-2' />
					{!isUserAuthor ? (
						<a
							href={`/${loaderData.story.authors[0].user.username}`}
							className='hover:underline'
						>
							More stories by {loaderData.story.authors[0].user.firstName}...
						</a>
					) : null}
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
						href={`/${loaderData.story.authors[0].user.username}`}
						className='hover:underline'
					>
						More stories by {loaderData.story.authors[0].user.firstName}...
					</a>
				</SignedOut>
			</div>
		</div>
	);
}
