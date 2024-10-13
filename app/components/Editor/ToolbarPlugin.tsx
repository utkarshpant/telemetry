/* eslint-disable no-mixed-spaces-and-tabs */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
	$createParagraphNode,
	$getSelection,
	$isRangeSelection,
	$isRootOrShadowRoot,
	FORMAT_TEXT_COMMAND,
	INSERT_PARAGRAPH_COMMAND,
	KEY_ENTER_COMMAND,
	SELECTION_CHANGE_COMMAND,
} from 'lexical';
import {
	$createHeadingNode,
	$isHeadingNode,
	$createQuoteNode,
	$isQuoteNode,
} from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { useCallback, useRef, useState, useEffect } from 'react';

export default function ToolbarPlugin() {
	const [editor] = useLexicalComposerContext();
	const toolbarRef = useRef<HTMLDivElement>(null);
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);
	const [isUnderline, setIsUnderline] = useState(false);
	const [isStrikethrough, setIsStrikethrough] = useState(false);
	const [isHeading, setIsHeading] = useState(false);
	const [isQuote, setIsQuote] = useState(false);

	const $updateToolbar = useCallback(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			setIsBold(selection.hasFormat('bold'));
			setIsItalic(selection.hasFormat('italic'));
			setIsUnderline(selection.hasFormat('underline'));
			setIsStrikethrough(selection.hasFormat('strikethrough'));

			const anchorNode = selection.anchor.getNode();
			const element = $findMatchingParent(anchorNode, (e) => {
				const parent = e.getParent();
				return parent !== null && $isRootOrShadowRoot(parent);
			});

			if (element !== null) {
				setIsHeading($isHeadingNode(element));
				setIsQuote($isQuoteNode(element));
			}
		}
	}, []);

	useEffect(() => {
		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					$updateToolbar();
				});
			}),
			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				() => {
					$updateToolbar();
					return false;
				},
				1
			),
			editor.registerCommand(
				KEY_ENTER_COMMAND,
				(event) => {
					const selection = $getSelection();
					if ($isRangeSelection(selection)) {
						const anchorNode = selection.anchor.getNode();
						if (anchorNode.getParent()?.getType() === 'title') {
							event?.preventDefault();
							editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
							return true;
						}
					}
					return false;
				},
				4
			)
		);
	}, [editor, $updateToolbar]);

	if (editor.isEditable()) {
		return (
			<div
				className='sticky top-2 animate-fade-in z-10 flex flex-col rounded font-sans gap-2 px-4 py-2 m-2 bg-gray-600 text-white align-baseline'
				ref={toolbarRef}
			>
				<span className='text-sm md:text-xs'>Formatting</span>
				<hr className='border-gray-500' />
				<div>
					<button
						onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
						className={`${
							isBold ? 'bg-slate-600' : ''
						} font-bold rounded w-10 h-10 md:w-8 md:h-8 hover:bg-white hover:bg-opacity-15 text-white align-middle`}
					>
						B
					</button>
					<button
						onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
						className={`${
							isItalic ? 'bg-slate-600' : ''
						} italic rounded w-10 h-10 md:w-8 md:h-8 hover:bg-white hover:bg-opacity-15 text-white align-middle`}
					>
						I
					</button>
					<button
						onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
						className={`line-through decoration-white rounded w-10 h-10 md:w-8 md:h-8 hover:bg-white hover:bg-opacity-15 text-white align-middle ${
							isStrikethrough ? 'bg-slate-600' : ''
						}`}
					>
						S
					</button>
					<button
						onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
						className={`underline decoration-white rounded w-10 h-10 md:w-8 md:h-8 hover:bg-white hover:bg-opacity-15 text-white align-middle ${
							isUnderline ? 'bg-slate-600' : ''
						}`}
					>
						U
					</button>
					<button
						onClick={() => {
							editor.update(() => {
								const selection = $getSelection();
								if ($isRangeSelection(selection)) {
									if (!isHeading) {
										$setBlocksType(selection, () => $createHeadingNode('h2'));
									} else {
										$setBlocksType(selection, () => $createParagraphNode());
									}
								}
							});
						}}
						className={`font-heading rounded w-auto px-4 md:px-2 h-10 md:h-8 hover:bg-white hover:bg-opacity-15 text-white align-middle ${
							isHeading ? 'bg-white bg-opacity-15' : ''
						}`}
					>
						Heading
					</button>
					<button
						onClick={() => {
							editor.update(() => {
								const selection = $getSelection();
								if ($isRangeSelection(selection)) {
									if (!isQuote) {
										$setBlocksType(selection, () => $createQuoteNode());
									} else {
										$setBlocksType(selection, () => $createParagraphNode());
									}
								}
							});
						}}
						className={`italic rounded w-auto px-4 md:px-2 h-10 md:h-8 hover:bg-white hover:bg-opacity-15 text-white align-middle ${
							isQuote ? 'bg-white bg-opacity-15' : ''
						}`}
					>
						&quot;Quote&quot;
					</button>
				</div>
			</div>
		);
	}
}
