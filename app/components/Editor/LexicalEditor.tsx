import {
	$createParagraphNode,
	$createTextNode,
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
import { QuoteNode } from '@lexical/rich-text';
import TreeViewPlugin from './TreeViewPlugin';
import { useRouteLoaderData, useSearchParams } from '@remix-run/react';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ReactNode } from 'react';
import { $createTitleNode, TitleNode } from './nodes/TitleNode';
import { useDebounceFetcher } from 'remix-utils/use-debounce-fetcher';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import EditorialPlugin from './EditorialPlugin';
import { StoryLoaderData } from '~/routes/story_.$storyId';
import { SubtitleNode } from './nodes/SubtitleNode';
// import Header from '../Header/Header';

const theme: EditorThemeClasses = {
	// Define your theme here
	text: {
		underline: 'underline',
		strikethrough: 'line-through',
		underlineStrikethrough: 'underline-line-through',
		bold: 'font-bold',
		italic: 'italic',
		base: 'text-left',
		code: 'code',
	},
	paragraph: 'font-serif font-normal',
	root: 'text-left',
	ltr: 'text-left',
	heading: {
		h1: 'editor-heading-1',
		h2: 'editor-heading-2',
	},
	quote: 'quote',
	placeholder: 'placeholder',
	code: 'code',
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
				// append title and content nodes;
				if (!story.title) {
					const titleNode = $createTitleNode().append($createTextNode('Untitled.'));
					root.append(titleNode);
				}
				if (!story.content) {
					const placeholderContent = $createParagraphNode().append(
						$createTextNode('Start typing here...').setMode('token')
					);
					root.append(placeholderContent);
				}
				const parser = new DOMParser();
				const dom = parser.parseFromString(story.content, 'text/html');
				const nodes = $generateNodesFromDOM(editor, dom);
				root.select();
				$insertNodes(nodes);
			}
		}
	};
	return (
		<ClientOnly
			fallback={
				<div className='w-full h-screen flex items-center justify-center animate-fade-in'>
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
						nodes: [QuoteNode, TitleNode, SubtitleNode],
					}}
				>
					{children}

					<div className='flex flex-col md:flex-row items-center md:items-start w-full min-h-screen'>
						<div className='relative min-h-[56vh] md:min-h-screen w-full md:w-4/5 no-scrollbar overflow-scroll md:border-r border-r-stone-400 dark:border-r-stone-700 shadow-2xl p-6 md:p-12 md:pr-6 md:print:pr-12 flex flex-col gap-1  flex-shrink-0'>
							{storyData.allowEdits ? <ToolbarPlugin /> : null}
							<RichTextPlugin
								contentEditable={
									<ContentEditable
										className={`animate-fade-in w-full min-h-full flex-1`}
									/>
								}
								placeholder={
									<div className='pointer-events-none absolute top-28 mt-3 md:top-24 left-4 text text-opacity-45 text-2xl font-serif'>
										Enter some text...
									</div>
								}
								ErrorBoundary={LexicalErrorBoundary}
							/>
							{searchParams.get('debug') === 'true' && <TreeViewPlugin />}
							<OnChangePlugin
								onChange={(editorState, editor) => {
									editorState.read(() => {
										const titleNodes = $getRoot()
											.getChildren()
											.filter((node) => node.getType() === 'title');
										const subtitleNodes = $getRoot()
											.getChildren()
											.filter((node) => node.getType() === 'subtitle');
										const formData = new FormData();
										// content changed
										const html = $generateHtmlFromNodes(editor);
										formData.append('content', html);
										const wordCount = $getRoot()
											.getTextContent()
											.split(/\s+/).length;
										formData.append('wordCount', wordCount.toString());

										// extract title
										if (titleNodes.length > 0) {
											const titleNode = titleNodes[0];
											formData.append(
												'title',
												titleNode?.getTextContent() || ''
											);
										}
										// extract subtitle
										if (subtitleNodes.length > 0) {
											const subtitleNode = subtitleNodes[0];
											formData.append(
												'subtitle',
												subtitleNode?.getTextContent() || ''
											);
										}
										debouncedFetcher.submit(formData, {
											method: 'POST',
											action: `/api/story/${storyData.story.id}/update`,
											debounceTimeout: 1000,
											fetcherKey: 'story-update',
										});
									});
								}}
								ignoreSelectionChange
							/>
							<HistoryPlugin />
						</div>
						<div className='p-6 py-12 no-scrollbar w-full md:w-1/5 flex flex-col gap-4 overflow-y-scroll flex-shrink-0 min-h-full print:hidden h-full flex-1'>
							<EditorialPlugin />
						</div>
					</div>
					{/* <div className='flex flex-col md:flex-row gap-0'>
					</div> */}
				</LexicalComposer>
			)}
		</ClientOnly>
	);
}
