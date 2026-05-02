import { ICommand } from '../ICommand';
import { FileSystem } from '../../engine/FileSystem';

export class PwdCommand implements ICommand {
    public execute(args: string[], fs: FileSystem): string {
        return fs.pwd();
    }
}