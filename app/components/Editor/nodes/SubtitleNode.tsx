/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	$createParagraphNode,
	DOMConversionMap,
	DOMExportOutput,
	EditorConfig,
	ElementNode,
	LexicalEditor,
	LexicalNode,
	NodeKey,
	ParagraphNode,
	RangeSelection,
} from 'lexical';

export class SubtitleNode extends ElementNode {
	private placeholder: string = 'Add a subtitle...';

	constructor(key?: NodeKey) {
		super(key);
	}

	static getType(): string {
		return 'subtitle';
	}

	static clone(node: SubtitleNode): SubtitleNode {
		return new SubtitleNode(node.__key);
	}

	createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
		const subtitle = document.createElement('h2');
		subtitle.id = 'subtitle';
		subtitle.className = 'editor-heading-2';
		return subtitle;
	}

	updateDOM(_prevNode: SubtitleNode, _dom: HTMLElement, _config: EditorConfig): boolean {
		return false;
	}

	exportDOM(editor: LexicalEditor): DOMExportOutput {
        const subtitle = document.createElement('h2');
		subtitle.classList.add('editor-heading-2');
		return { element: subtitle };
	}

	static importDOM?: (() => DOMConversionMap | null) | undefined = () => {
		return {
			h2: (node: Node) => ({
				conversion: (domNode: Node) => {
					const nodeName = domNode.nodeName.toLowerCase();
					if (nodeName === 'h2') {
						const node = $createSubtitleNode();
						return {
							node,
						};
					}
					return null;
				},
				priority: 1,
			}),
		};
	};

	insertNewAfter(selection: RangeSelection, restoreSelection?: boolean): null | ParagraphNode {
		const newElement = $createParagraphNode();
		newElement.setTextFormat(selection.format);
		newElement.setTextStyle(selection.style);
		const direction = this.getDirection();
		newElement.setDirection(direction);
		newElement.setFormat(this.getFormatType());
		this.insertAfter(newElement, restoreSelection);
		return newElement;
	}
}

export function $createSubtitleNode(): SubtitleNode {
	return new SubtitleNode();
}

export function $isSubtitleNode(node: LexicalNode | null | undefined): node is SubtitleNode {
	return node instanceof SubtitleNode;
}
