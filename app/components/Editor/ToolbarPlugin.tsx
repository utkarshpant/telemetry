/* eslint-disable no-mixed-spaces-and-tabs */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
	$createParagraphNode,
	$createTextNode,
	$getSelection,
	$isRangeSelection,
	$isRootOrShadowRoot,
	FORMAT_TEXT_COMMAND,
	SELECTION_CHANGE_COMMAND,
} from 'lexical';
import {
	$createHeadingNode,
	$isHeadingNode,
	$createQuoteNode,
	$isQuoteNode,
	HeadingTagType,
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
				(_payload, _newEditor) => {
					$updateToolbar();
					return false;
				},
				1
			)
		);
	}, [editor, $updateToolbar]);

	return (
		<div
			className='fixed top-2 right-2 mx-2 z-10 flex flex-row max-w-max rounded gap-2 px-4 py-2 bg-gray-800 bg-opacity-50 text-white align-baseline'
			ref={toolbarRef}
		>
			<button
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
				className={`${
					isBold ? 'font-bold' : 'font-normal'
				} rounded w-8 h-8 hover:bg-white hover:bg-opacity-15 text-white align-middle`}
			>
				B
			</button>
			<button
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
				className={`${
					isItalic ? 'italic' : ''
				} rounded w-8 h-8 hover:bg-white hover:bg-opacity-15 text-white align-middle`}
			>
				I
			</button>
			<button
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
				className={`line-through decoration-white rounded w-8 h-8 hover:bg-white hover:bg-opacity-15 text-white align-middle ${
					isStrikethrough ? 'bg-slate-600' : ''
				}`}
			>
				S
			</button>
			<button
				onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
				className={`underline decoration-white rounded w-8 h-8 hover:bg-white hover:bg-opacity-15 text-white align-middle ${
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
								$setBlocksType(selection, () => $createHeadingNode('h1'));
							} else {
								$setBlocksType(selection, () => $createParagraphNode());
							}
						}
					});
				}}
				className={`font-bold rounded w-auto px-2 h-8 hover:bg-white hover:bg-opacity-15 text-white align-middle ${
					isHeading ? 'bg-white bg-opacity-15' : ''
				}`}
			>
				H1
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
				className={`italic rounded w-auto px-2 h-8 hover:bg-white hover:bg-opacity-15 text-white align-middle ${
					isQuote ? 'bg-white bg-opacity-15' : ''
				}`}
			>
				&quot;Quote&quot;
			</button>
			{/* <div>Current selection is heading:</div> */}
		</div>
	);
}
