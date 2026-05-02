import { ICommand } from '../ICommand';
import { FileSystem } from '../../engine/FileSystem';
import { FileNode } from '../../core/Nodes';

export class CatCommand implements ICommand {
    execute(args: string[], fs: FileSystem): string {
        const fileName = args[0];
        if (!fileName) return "cat: missing file operand";

        const currentDir = fs.getCwd();
        const node = currentDir.getChildren().find(child => child.getName() === fileName);

        if (!node) return `cat: ${fileName}: No such file or directory`;

        if (node.isDirectory()) {
            return `cat: ${fileName}: Is a directory`;
        }

        // Type casting to FileNode to access your read() method
        return (node as FileNode).read();
    }
}