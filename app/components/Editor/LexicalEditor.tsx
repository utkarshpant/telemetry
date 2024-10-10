import { $getRoot, $getSelection, EditorThemeClasses } from 'lexical';
import { useEffect } from 'react';

import { InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ClientOnly } from 'remix-utils/client-only';
import ToolbarPlugin from './ToolbarPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TreeView } from '@lexical/react/LexicalTreeView';
import TreeViewPlugin from './TreeViewPlugin';

import { useSearchParams } from '@remix-run/react';

const theme: EditorThemeClasses = {
	// Define your theme here
	text: {
		underline: 'underline',
		strikethrough: 'line-through',
		underlineStrikethrough: 'underline-line-through',
	},
	heading: {
		h1: 'text-4xl font-bold',
	},
	quote: 'quote',
};

function onError(error: Error) {
	console.error(error);
}

export default function Editor({ allowEdits }: { allowEdits: boolean; initialContent: string }) {
	const initialConfig: InitialConfigType = {
		namespace: 'MyEditor',
		theme,
		onError,
		editable: allowEdits,
		nodes: [HeadingNode, QuoteNode]
	};
	const [searchParams] = useSearchParams();

	return (
		<ClientOnly fallback={<div>Loading...</div>}>
			{() => (
				<LexicalComposer initialConfig={initialConfig}>
					<ToolbarPlugin />
					<RichTextPlugin
						contentEditable={
							<ContentEditable className='bg-white p-4 h-full decoration-black rounded text-black text-sm' />
						}
						placeholder={<div className='fixed -mt-[0.125rem] top-4 left-4 text-black'>Enter some text...</div>}
						ErrorBoundary={LexicalErrorBoundary}
					/>
					{searchParams.get('debug') === 'true' && <TreeViewPlugin />}
					<HistoryPlugin />
				</LexicalComposer>
			)}
		</ClientOnly>
	);
}
