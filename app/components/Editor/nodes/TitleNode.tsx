/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	DOMExportOutput,
	EditorConfig,
	ElementNode,
	LexicalEditor,
	LexicalNode,
	NodeKey,
} from 'lexical';

export class TitleNode extends ElementNode {
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

	updateDOM(_prevNode: unknown, _dom: HTMLElement, _config: EditorConfig): boolean {
		return false;
	}

	exportDOM(editor: LexicalEditor): DOMExportOutput {
		const title = document.createElement('h1');
		title.classList.add('text-4xl');
		return { element: title };
	}
}

export function $createTitleNode(): TitleNode {
	return new TitleNode();
}

export function $isTitleNode(node: LexicalNode | null | undefined): node is TitleNode {
	return node instanceof TitleNode;
}