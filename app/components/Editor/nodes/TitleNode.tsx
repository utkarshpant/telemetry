/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    $createParagraphNode,
	DOMExportOutput,
	EditorConfig,
	ElementFormatType,
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
		title.classList.add('text-6xl', 'my-4', 'font-heading');
		return title;
	}

	updateDOM(_prevNode: TitleNode, _dom: HTMLElement, _config: EditorConfig): boolean {
		return false;
	}

	exportDOM(editor: LexicalEditor): DOMExportOutput {
		const title = document.createElement('h1');
		title.classList.add('text-4xl');
		return { element: title };
	}

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
