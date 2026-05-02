import { ICommand } from '../ICommand';
import { FileSystem } from '../../engine/FileSystem';

export class LsCommand implements ICommand {
    public execute(args: string[], fs: FileSystem): string {
        const path = args[0]; // Undefined is fine, your engine handles it
        const nodes = fs.ls(path);

        if (nodes.length === 0) {
            return '';
        }

        // Translates the FileSystemNode[] array into a human-readable string
        return nodes.map(node => node.getName()).join('  ');
    }
}