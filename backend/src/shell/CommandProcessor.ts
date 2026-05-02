import { FileSystem } from '../engine/FileSystem';
import { ICommand } from './ICommand';
import { TerminalHistory } from './TerminalHistory'; // <-- Imported
import { CdCommand } from './commands/CdCommand';
import { LsCommand } from './commands/LsCommand';
import { MkdirCommand } from './commands/MkdirCommand';
import { PwdCommand } from './commands/PwdCommand';

export class CommandProcessor {
    private fs: FileSystem;
    private registry: Map<string, ICommand>;
    public history: TerminalHistory; // <-- Added as per UML

    constructor(fs: FileSystem) {
        this.fs = fs;
        this.registry = new Map();
        this.history = new TerminalHistory(); // <-- Initialized
        this.registerDefaultCommands();
    }

    private registerDefaultCommands(): void {
        this.registry.set('cd', new CdCommand());
        this.registry.set('ls', new LsCommand());
        this.registry.set('mkdir', new MkdirCommand());
        this.registry.set('pwd', new PwdCommand());
    }

    public register(name: string, command: ICommand): void {
        this.registry.set(name, command);
    }

    public process(input: string): string {
        const trimmed = input.trim();
        if (!trimmed) return '';

        // CAPTURE THE PATH BEFORE THE COMMAND CHANGES IT
        const currentPath = this.fs.pwd();

        const parts = trimmed.split(/\s+/);
        const commandName = parts[0]!;
        const args = parts.slice(1);

        const command = this.registry.get(commandName);

        if (!command) {
            const errorOutput = `${commandName}: command not found`;
            this.history.push({
                path: currentPath, // <-- Add to history
                command: input,
                output: errorOutput,
                timestamp: new Date(),
                type: 'ERROR'
            });
            return errorOutput;
        }

        try {
            const output = command.execute(args, this.fs);
            this.history.push({
                path: currentPath, // <-- Add to history
                command: input,
                output: output,
                timestamp: new Date(),
                type: 'SUCCESS'
            });
            return output;

        } catch (error: any) {
            this.history.push({
                path: currentPath, // <-- Add to history
                command: input,
                output: error.message,
                timestamp: new Date(),
                type: 'ERROR'
            });
            return error.message;
        }
    }
    public getCurrentPath(): string {
        return this.fs.pwd();
    }
}