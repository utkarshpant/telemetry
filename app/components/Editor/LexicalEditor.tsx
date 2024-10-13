import {
	$createTextNode,
	$getNodeByKey,
	$getRoot,
	$insertNodes,
	LexicalEditor,
	type EditorThemeClasses,
} from 'lexical';
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
import { ReactNode } from 'react';
import { $createTitleNode, TitleNode } from './nodes/TitleNode';
import { useDebounceFetcher } from 'remix-utils/use-debounce-fetcher';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
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

export default function Editor({
	children,
}: {
	children?: ReactNode;
}) {
	const [searchParams] = useSearchParams();
	const storyData = useRouteLoaderData('routes/story.$storyId') as StoryLoaderData;
	const debouncedFetcher = useDebounceFetcher();

	const $prepopulatedRichText = (editor: LexicalEditor) => {
		const root = $getRoot();
		if ('story' in storyData) {
			const { story } = storyData;
			if (root.getFirstChild() === null) {
				if (story) {
					// append title and content nodes;
					const parser = new DOMParser();
					const dom = parser.parseFromString(story.content, 'text/html');
					const nodes = $generateNodesFromDOM(editor, dom);
					// if (!nodes.some((node) => node.getType() === 'title')) {
					// 	// no title node found in content - generate it from the title field
					// 	const titleNode = $createTitleNode();
					// 	titleNode.append($createTextNode(story.title));
					// 	nodes.unshift(titleNode);
					// }
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
							$prepopulatedRichText(editor);
						},
						onError,
						editable: true,
						nodes: [HeadingNode, QuoteNode, TitleNode],
					}}
				>
					{children}
					<ToolbarPlugin />
					{/* <OnChangePlugin
						onChange={(editorState, editor) => {
							editorState.read(() => {
								console.log(editorState);
							});
						}}
						ignoreSelectionChange
					/> */}
					<RichTextPlugin
						contentEditable={
							<ContentEditable className='animate-fade-in p-4 w-full h-full text-white border-none focus:outline-none text-2xl md:text-xl font-serif text-left' />
						}
						placeholder={
							<div className='pointer-events-none absolute top-28 mt-3 md:top-24 left-4 text text-opacity-45 text-2xl font-serif'>
								Enter some text...
							</div>
						}
						ErrorBoundary={LexicalErrorBoundary}
					/>
					<OnChangePlugin
						onChange={(editorState, editor) => {
							editorState.read(() => {
								const titleNodes = $getRoot().getChildren().filter((node) => node.getType() === 'title');
								if (titleNodes.length > 0) {
									const titleNode = titleNodes[0];
									if ('story' in storyData) {
										// console.log(titleNode?.getTextContent(), storyData.story.title);
										// content changed
										const formData = new FormData();
										const html = $generateHtmlFromNodes(editor);
										formData.append('content', html);
										formData.append('title', titleNode?.getTextContent() || '');
										debouncedFetcher.submit(formData, {
											method: 'POST',
											action: `/api/story/${storyData.story.id}/update`,
											debounceTimeout: 1000,
										});
									}
								}
							})
						}}
						ignoreSelectionChange
					/>
					{searchParams.get('debug') === 'true' && <TreeViewPlugin />}
					<HistoryPlugin />
				</LexicalComposer>
			)}
		</ClientOnly>
	);
}
