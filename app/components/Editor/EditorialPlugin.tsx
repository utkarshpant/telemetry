import useUser from '~/hooks/useUser';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { loader } from '~/routes/story_.$storyId';
import InfoIcon from '../../assets/info-material-icon.svg?url'; // Adjust the path as necessary
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useState } from 'react';

export default function EditorialPlugin() {
	const loaderData = useLoaderData<typeof loader>();
	const { signedIn } = useUser();
	const editDateString = new Date(loaderData.story.updatedAt).toLocaleDateString();
	const editTimeString = new Date(loaderData.story.updatedAt).toLocaleTimeString();
	const publishDateString =
		loaderData.story.isPublished && loaderData.story.publishedAt
			? new Date(loaderData.story.publishedAt).toLocaleDateString()
			: null;
	const [editor] = useLexicalComposerContext();
	const [editable, setEditable] = useState(false);
	const fetcher = useFetcher();

	useEffect(() => {
		return editor.registerEditableListener((editable) => {
			setEditable(editable);
			if (editable) {
				editor.focus();
			}
		});
	});

	if (signedIn) {
		return (
			<div
				className={
					'animate-fade-in md:px-8 md:py-8 p-4 flex flex-col gap-4 w-full min-h-full font-sans transition-all border-1 border-t-white'
				}
			>
				<div className='text-lg font-medium'>Editorial</div>
				<div className='flex flex-col gap-3'>
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
					<button
						type='button'
						className={`w-full md:w-56 px-4 py-2 rounded ${
							editor.isEditable() ? 'bg-green-700' : 'bg-sky-800'
						} text-white`}
						onClick={() => {
							editor.update(() => {
								editor.setEditable(!editor.isEditable());
							});
						}}
					>
						{editable ? (
							<div className='flex flex-row items-center gap-4'>
								<svg
									width='10'
									height='10'
									xmlns='http://www.w3.org/2000/svg'
								>
									<circle
										cx='5'
										cy='5'
										r='5'
										fill='white'
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
						className={`w-full md:w-56 px-4 py-2 ${
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
						{loaderData.story.isPublished ? 'Unpublish' : 'Publish'}
					</button>
				</div>
			</div>
		);
	} else {
		return null;
	}
}
