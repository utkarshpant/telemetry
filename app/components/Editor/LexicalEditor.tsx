import { $getRoot, $insertNodes, LexicalEditor, type EditorThemeClasses } from 'lexical';
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
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ReactNode } from 'react';
import { TitleNode } from './nodes/TitleNode';
import { useDebounceFetcher } from 'remix-utils/use-debounce-fetcher';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import EditorialPlugin from './EditorialPlugin';
import { StoryLoaderData } from '~/routes/story_.$storyId';

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
		h2: 'editor-heading-2',
		h1: 'editor-heading-1',
	},
	quote: 'quote',
};

function onError(error: Error) {
	console.error(error);
}

export default function Editor({ children }: { children?: ReactNode }) {
	const [searchParams] = useSearchParams();
	const storyData = useRouteLoaderData('routes/story_.$storyId') as unknown as StoryLoaderData;
	const debouncedFetcher = useDebounceFetcher();

	const $prePopulatedRichText = (editor: LexicalEditor) => {
		const root = $getRoot();
		if ('story' in storyData) {
			const { story } = storyData;
			if (root.getFirstChild() === null) {
				if (story) {
					// append title and content nodes;
					const parser = new DOMParser();
					const dom = parser.parseFromString(story.content, 'text/html');
					const nodes = $generateNodesFromDOM(editor, dom);
					root.select();
					$insertNodes(nodes);
				}
			}
		}
	};
	return (
		<ClientOnly
			fallback={
				<div className='w-full h-full flex items-center justify-center animate-fade-in'>
					Loading...
				</div>
			}
		>
			{() => (
				<LexicalComposer
					initialConfig={{
						namespace: 'TelemetryEditor',
						theme,
						editorState(editor) {
							$prePopulatedRichText(editor);
						},
						onError,
						editable: false,
						nodes: [HeadingNode, QuoteNode, TitleNode],
					}}
				>
					{children}
					<div className='flex flex-col min-h-full w-full'>
						{storyData.allowEdits ? <ToolbarPlugin /> : null}
						<RichTextPlugin
							contentEditable={
								<ContentEditable className={`animate-fade-in px-4 w-full md:w-8/12 md:mx-auto h-full border-none focus:outline-none text-2xl md:text-xl font-serif text-left`} />
							}
							placeholder={
								<div className='pointer-events-none absolute top-28 mt-3 md:top-24 left-4 text text-opacity-45 text-2xl font-serif'>
									Enter some text...
								</div>
							}
							ErrorBoundary={LexicalErrorBoundary}
						/>
						{searchParams.get('debug') === 'true' && <TreeViewPlugin />}
					</div>
					<div className={`h-full w-full md:w-1/3`}>
						<EditorialPlugin />
					</div>
					{/* <div className='flex flex-col md:flex-row gap-0'>
					</div> */}
					<OnChangePlugin
						onChange={(editorState, editor) => {
							editorState.read(() => {
								const titleNodes = $getRoot()
									.getChildren()
									.filter((node) => node.getType() === 'title');
								if (titleNodes.length > 0) {
									const titleNode = titleNodes[0];
									if ('story' in storyData) {
										// content changed
										const formData = new FormData();
										const html = $generateHtmlFromNodes(editor);
										formData.append('content', html);
										formData.append('title', titleNode?.getTextContent() || '');
										debouncedFetcher.submit(formData, {
											method: 'POST',
											action: `/api/story/${storyData.story.id}/update`,
											debounceTimeout: 1000,
											fetcherKey: 'story-update',
										});
									}
								}
							});
						}}
						ignoreSelectionChange
					/>
					<HistoryPlugin />
				</LexicalComposer>
			)}
		</ClientOnly>
	);
}
