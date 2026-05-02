import { ICommand } from '../ICommand';
import { FileSystem } from '../../engine/FileSystem';
import { FileNode } from '../../core/Nodes';

export class TouchCommand implements ICommand {
    execute(args: string[], fs: FileSystem): string {
        // 1. Guard against undefined (Fixes Error 2345)
        const fileName = args[0];
        if (!fileName) {
            return "touch: missing file operand";
        }

        // 2. Use the correct method to get the current node (Fixes Error 2339)
        const currentDir = fs.getCwd();

        // 3. Check if a node with this name already exists
        // Assuming DirectoryNode has a getChild or similar method
        const existingNode = currentDir.getChildren().find(child => child.getName() === fileName);

        if (existingNode) {
            // In a real terminal, touch on an existing file updates the access time.
            // For FileFlux, we can simply return an empty string.
            return "";
        }

        // Now fileName is guaranteed to be a string
        const newFile = new FileNode(fileName, currentDir);
        currentDir.addChild(newFile);

        return "";
    }
}