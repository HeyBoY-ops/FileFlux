import { ICommand } from '../ICommand';
import { FileSystem } from '../../engine/FileSystem';

export class MkdirCommand implements ICommand {
    public execute(args: string[], fs: FileSystem): string {
        if (args.length === 0) {
            throw new Error("mkdir: missing operand");
        }

        fs.mkdir(args[0]!);
        return '';
    }
}