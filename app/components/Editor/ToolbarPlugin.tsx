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
	INSERT_PARAGRAPH_COMMAND,
	KEY_ENTER_COMMAND,
	SELECTION_CHANGE_COMMAND,
	TextNode,
} from 'lexical';
import {
	$createHeadingNode,
	$isHeadingNode,
	$createQuoteNode,
	$isQuoteNode,
} from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { useCallback, useRef, useState, useEffect } from 'react';
import { useRouteLoaderData } from '@remix-run/react';
import { StoryLoaderData } from '~/routes/story_.$storyId';

export default function ToolbarPlugin() {
	const [editor] = useLexicalComposerContext();
	const [editable, setIsEditable] = useState(false);
	const toolbarRef = useRef<HTMLDivElement>(null);
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);
	const [isUnderline, setIsUnderline] = useState(false);
	const [isStrikethrough, setIsStrikethrough] = useState(false);
	const [isHeading, setIsHeading] = useState(false);
	const [isQuote, setIsQuote] = useState(false);
	const [isSuperscript, setIsSuperscript] = useState(false);

	const $updateToolbar = useCallback(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			setIsBold(selection.hasFormat('bold'));
			setIsItalic(selection.hasFormat('italic'));
			setIsUnderline(selection.hasFormat('underline'));
			setIsStrikethrough(selection.hasFormat('strikethrough'));
			setIsSuperscript(selection.hasFormat('superscript'));

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
			editor.registerEditableListener((editable) => {
				setIsEditable(editable);
			}),
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
			),
			editor.registerNodeTransform(TextNode, (textNode) => {
				/**
				 * if the last character is a space, check if the 3 characters before the space match "\d{1, 3}th".
				 * If they do, remove these 3 characters before the space, insert a new ElementNode, insert one TextNode with the number and another with the "th".
				 * Then, apply the superscript format to the "th" TextNode.
				 */

				const textContent = textNode.getTextContent();
				const lastChar = textContent[textContent.length - 1];
				if (lastChar === ' ') {
					const match = textContent.trim().match(/(\d{1,3})th$/);
					if (match) {
						const [fullMatch, number] = match;
						const index = textContent.lastIndexOf(fullMatch);
						const before = textContent.slice(0, index);
						const numberNode = new TextNode(number);
						const suffixNode = new TextNode('th');
						suffixNode.setFormat('superscript');
						textNode.setTextContent(before);
						textNode.insertAfter(numberNode);
						const spaceNode = $createTextNode(' ');
						numberNode.insertAfter(suffixNode);
						suffixNode.insertAfter(spaceNode);
						spaceNode.selectNext();
					}
				}
			})
		);
	}, [editor, $updateToolbar]);

	if (editable) {
		return (
			<div
				className='sticky top-4 animate-fade-in z-10 flex flex-col rounded font-sans gap-2 px-4 py-2 w-full md:w-8/12 md:mx-auto bg-gray-950 dark:bg-gray-600 text-white align-baseline'
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
							isItalic ? 'bg-white bg-opacity-15' : ''
						} italic rounded w-10 h-10 md:w-8 md:h-8 hover:bg-white hover:bg-opacity-15 text-white align-middle`}
					>
						I
					</button>
					<button
						onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
						className={`line-through decoration-white rounded w-10 h-10 md:w-8 md:h-8 hover:bg-white hover:bg-opacity-15 text-white align-middle ${
							isStrikethrough ? 'bg-white bg-opacity-15' : ''
						}`}
					>
						S
					</button>
					<button
						onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
						className={`underline decoration-white rounded w-10 h-10 md:w-8 md:h-8 hover:bg-white hover:bg-opacity-15 text-white align-middle ${
							isUnderline ? 'bg-white bg-opacity-15' : ''
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
					<button
						onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')}
						className={`rounded w-auto px-4 md:px-2 h-10 md:h-8 hover:bg-white hover:bg-opacity-15 text-white align-middle ${
							isSuperscript ? 'bg-white bg-opacity-15' : ''
						}`}
					>
						<span>
							X<sup>2</sup>
						</span>
					</button>
				</div>
			</div>
		);
	}
}
