import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TreeView } from "@lexical/react/LexicalTreeView";

export default function TreeViewPlugin() {
    const [editor] = useLexicalComposerContext();
    return (
        <TreeView
            editor={editor}
            viewClassName="bg-white p-4 h-full decoration-black rounded text-black text-sm"
            // className='bg-white p-4 h-full decoration-black rounded text-black text-sm'
        />
    );
}