import { ICommand } from '../ICommand';
import { FileSystem } from '../../engine/FileSystem';
import { FileNode } from '../../core/Nodes';

export class EchoCommand implements ICommand {
    execute(args: string[], fs: FileSystem): string {
        if (args.length === 0) return "";

        const redirectIndex = args.indexOf('>');

        // --- Standard Echo (No redirection) ---
        if (redirectIndex === -1) {
            return args.join(' ').replace(/"/g, '');
        }

        // --- Redirection Logic (echo "text" > file) ---
        const content = args.slice(0, redirectIndex).join(' ').replace(/"/g, '');
        const fileName = args[redirectIndex + 1];

        if (!fileName) {
            return "echo: syntax error near unexpected token `newline'";
        }

        const currentDir = fs.getCwd();
        let node = currentDir.getChildren().find(child => child.getName() === fileName);

        // If file doesn't exist, create it (Just like 'touch')
        if (!node) {
            node = new FileNode(fileName, currentDir);
            currentDir.addChild(node);
        }

        if (node.isDirectory()) {
            return `echo: ${fileName}: Is a directory`;
        }

        // Cast to FileNode to access your write() method
        (node as FileNode).write(content);
        return "";
    }
}