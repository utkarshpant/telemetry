import type * as Party from 'partykit/server';
import { onConnect } from 'y-partykit';
import type { Binding, Provider } from '@lexical/yjs';
import {
	$getRoot,
	type Klass,
	type LexicalEditor,
	type LexicalNode,
	type LexicalNodeReplacement,
	type SerializedEditorState,
	type SerializedLexicalNode,
} from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import { createHeadlessEditor } from '@lexical/headless';
import { createBinding, syncLexicalUpdateToYjs, syncYjsChangesToLexical } from '@lexical/yjs';
import { type YEvent, applyUpdate, Doc, Transaction } from 'yjs';
import * as Y from 'yjs';
import { TitleNode } from '../../app/components/Editor/nodes/TitleNode';
import { SubtitleNode } from '../../app/components/Editor/nodes/SubtitleNode';
import { QuoteNode } from '@lexical/rich-text';
import { parseHTML } from 'linkedom';

// Set up JSDOM before using any HTML generation functionality
const dom = parseHTML('<!DOCTYPE html><html><body></body></html>');
globalThis.document = dom.window.document;
globalThis.window = dom.window as any;
globalThis.DOMParser = dom.window.DOMParser;

export default class YjsServer implements Party.Server {
	constructor(public party: Party.Room) {}

	onConnect(conn: Party.Connection) {
		try {
			const roomId = this.party.id;
			return onConnect(conn, this.party, {
				load: async () => {
					// check if a yjs doc is already initialized. If not, get JSON state from api and initialize a lexical editor with it.
					// then create a yjs doc from the lexical editor state and set it in the party room
					const state = await fetch(
						`${process.env.TELEMETRY_HOST}/api/story/${this.party.id}`
					)
						.then(async (res) => {
							const response = await res.json();
							console.log('Fetched story state:', response);
							return response;
						})
						.catch((e) => {
							console.error('Error fetching story state:', e);
						});

					const result = withHeadlessCollaborationEditor(
						[TitleNode, SubtitleNode, QuoteNode],
						(editor, binding) => {
							// try {
								editor.setEditorState(editor.parseEditorState(state));
							// } catch (e) {
							// 	console.error(
							// 		'An error occured while setting editor state specifically!',
							// 		e
							// 	);
							// }

							// const yDocState = Y.encodeStateAsUpdate(binding.doc);
							// Y.applyUpdate(ydoc, yDocState);
							// return ydoc;
							return binding.doc;
						}
					);
					return result;
				},
				// callback: {
				// 	handler(doc) {
				// 		const yDocState = Y.encodeStateAsUpdate(doc);
				// 		withHeadlessCollaborationEditor(
				// 			[TitleNode, SubtitleNode],
				// 			(editor, binding) => {
				// 				applyUpdate(binding.doc, yDocState, { isUpdateRemote: true });
				// 				editor.read(() => {
				// 					const titleNodes = $getRoot()
				// 						.getChildren()
				// 						.filter((node) => node.getType() === 'title');
				// 					const subtitleNodes = $getRoot()
				// 						.getChildren()
				// 						.filter((node) => node.getType() === 'subtitle');
				// 					const formData = new FormData();

				// 					// Now this will work with our JSDOM setup
				// 					const html = $generateHtmlFromNodes(editor);
				// 					formData.append('content', html);

				// 					const wordCount = $getRoot()
				// 						.getTextContent()
				// 						.split(/\s+/).length;
				// 					formData.append('wordCount', wordCount.toString());

				// 					// extract title
				// 					if (titleNodes.length > 0) {
				// 						const titleNode = titleNodes[0];
				// 						formData.append('title', titleNode?.getTextContent() || '');
				// 					}
				// 					// extract subtitle
				// 					if (subtitleNodes.length > 0) {
				// 						const subtitleNode = subtitleNodes[0];
				// 						formData.append(
				// 							'subtitle',
				// 							subtitleNode?.getTextContent() || ''
				// 						);
				// 					}

				// 					fetch(
				// 						`${process.env.TELEMETRY_HOST}/api/story/${roomId}/update`,
				// 						{
				// 							method: 'POST',
				// 							body: formData,
				// 							headers: {
				// 								'X-Telemetry-Party': roomId,
				// 							}
				// 						}
				// 					)
				// 						.then(async (res) => {
				// 							console.log(await res.json());
				// 						})
				// 						.catch((err) => console.warn('Error updating story:', err));
				// 				});
				// 			}
				// 		);
				// 	},
				// 	debounceWait: 1000, // Add debouncing to prevent too many updates
				// },
			});
		} catch (e) {
			console.warn('An error occured somewhere in the code', e);
		}
	}
}

/**
 * Headless Lexical Editor code
 */

function headlessConvertYDocStateToJSON(
	nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement>,
	yDocState: Uint8Array
): SerializedEditorState<SerializedLexicalNode> {
	return withHeadlessCollaborationEditor(nodes, (editor, binding) => {
		applyUpdate(binding.doc, yDocState, { isUpdateRemote: true });
		editor.update(() => {}, { discrete: true });

		return editor.getEditorState().toJSON();
	});
}

/**
 * Creates headless collaboration editor with no-op provider (since it won't
 * connect to message distribution infra) and binding. It also sets up
 * bi-directional synchronization between yDoc and editor
 */
function withHeadlessCollaborationEditor<T>(
	nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement>,
	callback: (editor: LexicalEditor, binding: Binding, provider: Provider) => T
): T {
	const editor = createHeadlessEditor({
		nodes,
	});

	const id = 'main';
	const doc = new Doc();
	const docMap = new Map([[id, doc]]);
	const provider = createNoOpProvider();
	const binding = createBinding(editor, provider, id, doc, docMap);

	const unsubscribe = registerCollaborationListeners(editor, provider, binding);

	const res = callback(editor, binding, provider);

	unsubscribe();

	return res;
}

function registerCollaborationListeners(
	editor: LexicalEditor,
	provider: Provider,
	binding: Binding
): () => void {
	const unsubscribeUpdateListener = editor.registerUpdateListener(
		({ dirtyElements, dirtyLeaves, editorState, normalizedNodes, prevEditorState, tags }) => {
			if (tags.has('skip-collab') === false) {
				syncLexicalUpdateToYjs(
					binding,
					provider,
					prevEditorState,
					editorState,
					dirtyElements,
					dirtyLeaves,
					normalizedNodes,
					tags
				);
			}
		}
	);

	const observer = (events: Array<YEvent<any>>, transaction: Transaction) => {
		if (transaction.origin !== binding) {
			syncYjsChangesToLexical(binding, provider, events, false);
		}
	};

	binding.root.getSharedType().observeDeep(observer);

	return () => {
		unsubscribeUpdateListener();
		binding.root.getSharedType().unobserveDeep(observer);
	};
}

function createNoOpProvider(): Provider {
	const emptyFunction = () => {};

	return {
		awareness: {
			getLocalState: () => null,
			getStates: () => new Map(),
			off: emptyFunction,
			on: emptyFunction,
			setLocalState: emptyFunction,
		},
		connect: emptyFunction,
		disconnect: emptyFunction,
		off: emptyFunction,
		on: emptyFunction,
	};
}
