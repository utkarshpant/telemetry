import { $createParagraphNode, $createTextNode, $getRoot, type EditorThemeClasses } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ClientOnly } from 'remix-utils/client-only';
import ToolbarPlugin from './ToolbarPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import TreeViewPlugin from './TreeViewPlugin';
import { useRouteLoaderData, useSearchParams } from '@remix-run/react';
import { StoryLoaderData } from '~/routes/story.$storyId';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';

const theme: EditorThemeClasses = {
	// Define your theme here
	text: {
		underline: 'underline',
		strikethrough: 'line-through',
		underlineStrikethrough: 'underline-line-through',
		bold: 'font-bold',
		italic: 'italic',
		base: 'text-left',
	},
	root: 'text-left',
	ltr: 'text-left',
	heading: {
		h1: 'editor-heading-1',
	},
	quote: 'quote',
};

function onError(error: Error) {
	console.error(error);
}

export default function Editor({ allowEdits }: { allowEdits: boolean }) {
	const [searchParams] = useSearchParams();
	const storyData = useRouteLoaderData('routes/story.$storyId') as StoryLoaderData;

	const $prepopulatedRichText = () => {
		const root = $getRoot();
		if ('story' in storyData) {
			const { story } = storyData;
			if (root.getFirstChild() === null) {
				if (story) {
					const para = $createParagraphNode();
					para.append($createTextNode(story.content));
					root.append(para);
				} else {
					const para = $createParagraphNode();
					para.append($createTextNode('Hello'));
					root.append(para);
				}
			}
		}
	};

	return (
		<ClientOnly fallback={<div>Loading...</div>}>
			{() => (
				<LexicalComposer
					initialConfig={{
						namespace: 'TelemetryEditor',
						theme,
						editorState: $prepopulatedRichText,
						onError,
						editable: true,
						nodes: [HeadingNode, QuoteNode],
					}}
				>
					<ToolbarPlugin />
					<OnChangePlugin
						onChange={(editorState, editor) => {
							editorState.read(() => {
								console.log(editorState);
							});
						}}
						ignoreSelectionChange
					/>
					<RichTextPlugin
						contentEditable={
							<ContentEditable className='p-4 w-full h-full text-white border-none focus:outline-none text-2xl md:text-xl font-serif text-left' />
						}
						placeholder={
							<div className='pointer-events-none absolute top-28 mt-3 md:top-24 left-4 text text-opacity-45 text-2xl font-serif'>
								Enter some text...
							</div>
						}
						ErrorBoundary={LexicalErrorBoundary}
					/>
					{searchParams.get('debug') === 'true' && <TreeViewPlugin />}
					<HistoryPlugin />
				</LexicalComposer>
			)}
		</ClientOnly>
	);
}
