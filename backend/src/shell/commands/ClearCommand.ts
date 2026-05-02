import { ICommand } from '../ICommand';
import { FileSystem } from '../../engine/FileSystem';

export class ClearCommand implements ICommand {
    execute(args: string[], fs: FileSystem): string {
        // Call the new method we just created in FileSystem
        fs.clear();

        return "System reset: File system cleared and returned to root (/).";
    }
}
