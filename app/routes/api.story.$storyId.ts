import { json, LoaderFunctionArgs } from '@remix-run/node';
import { prisma } from 'prisma/db.server';
import { createHeadlessEditor } from '@lexical/headless';
import { TitleNode } from '~/components/Editor/nodes/TitleNode';
import { QuoteNode } from '@lexical/rich-text';
import { SubtitleNode } from '~/components/Editor/nodes/SubtitleNode';
import {
	$getRoot,
	$getSelection,
	ParagraphNode,
	TextNode,
} from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';
import { JSDOM } from 'jsdom';

export async function loader({ request, params }: LoaderFunctionArgs) {
	const { storyId } = params;
	const editor = createHeadlessEditor({
		nodes: [TitleNode, QuoteNode, SubtitleNode, TextNode, ParagraphNode],
		theme: {
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
		},
	});

	const story = await prisma.story
		.findUnique({
			where: {
				id: Number(storyId),
			},
		});

	editor.update(() => {
		const root = $getRoot();
		const dom = new JSDOM(story?.content ?? "");
		root.select();
		const nodes = $generateNodesFromDOM(editor, dom.window.document);
		const selection = $getSelection();
		selection?.insertNodes(nodes);
	});
	const state = editor.read(() => {
		return editor.getEditorState().toJSON();
	})
	return json(state);
}
