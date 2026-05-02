import { ICommand } from '../ICommand';
import { FileSystem } from '../../engine/FileSystem';

export class CdCommand implements ICommand {
    public execute(args: string[], fs: FileSystem): string {
        const path = args[0] || ''; // If no args, pass empty string (routes to root in your engine)
        fs.cd(path);

        // 'cd' produces no output on success in a real terminal
        return '';
    }
}