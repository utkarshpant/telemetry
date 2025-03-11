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

export class TitleNode extends ElementNode {
	private placeholder: string = 'Untitled...';

	constructor(key?: NodeKey) {
		super(key);
	}

	static getType(): string {
		return 'title';
	}

	static clone(node: TitleNode): TitleNode {
		return new TitleNode(node.__key);
	}

	createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
		const title = document.createElement('h1');
		title.id = 'title';
		title.className = 'editor-heading-1';
		return title;
	}

	updateDOM(_prevNode: TitleNode, _dom: HTMLElement, _config: EditorConfig): boolean {
		return false;
	}

	exportDOM(editor: LexicalEditor): DOMExportOutput {
		const title = document.createElement('h1');
		title.classList.add('text-2xl');
		return { element: title };
	}

	static importDOM?: (() => DOMConversionMap | null) | undefined = () => {
		return {
			h1: (node: Node) => ({
				conversion: (domNode: Node) => {
					const nodeName = domNode.nodeName.toLowerCase();
					if (nodeName === 'h1') {
						const node = $createTitleNode();
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

export function $createTitleNode(): TitleNode {
	return new TitleNode();
}

export function $isTitleNode(node: LexicalNode | null | undefined): node is TitleNode {
	return node instanceof TitleNode;
}
