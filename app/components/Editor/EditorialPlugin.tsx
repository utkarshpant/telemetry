import useUser from '~/hooks/useUser';
import { useLoaderData } from '@remix-run/react';
import { loader } from '~/routes/story_.$storyId';
import InfoIcon from '../../assets/info-material-icon.svg?url'; // Adjust the path as necessary
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useState } from 'react';

export default function EditorialPlugin() {
	const loaderData = useLoaderData<typeof loader>();
	const { signedIn } = useUser();
	const editDateString = new Date(loaderData.story.updatedAt).toLocaleDateString();
	const editTimeString = new Date(loaderData.story.updatedAt).toLocaleTimeString();
	const [editor] = useLexicalComposerContext();
    const [editable, setEditable] = useState(false);

    useEffect(() => {
        return editor.registerEditableListener((editable) => {
            setEditable(editable);
            if (editable) {
                editor.focus();
            }
        });
    })
    
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
						This story was last saved
						on {editDateString} at {editTimeString}.
					</span>
					<button
						type='button'
						className={`w-52 px-4 py-2 rounded ${
							editor.isEditable() ? 'animate-pulse bg-green-800' : 'bg-sky-800'
						}`}
						onClick={() => {
                            editor.update(() => {
                                editor.setEditable(!editor.isEditable());
                            })
						}}
					>
						{editable ? "You're editing this story." : 'Edit this story.'}
					</button>
				</div>
			</div>
		);
	} else {
		return null;
	}
}