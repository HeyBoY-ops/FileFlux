import { ICommand } from '../ICommand';
import { FileSystem } from '../../engine/FileSystem';

export class RmCommand implements ICommand {
    execute(args: string[], fs: FileSystem): string {
        const target = args[0];
        if (!target) return "rm: missing operand";

        // Call the engine's remove logic
        return fs.remove(target);
    }
}