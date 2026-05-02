import { FileSystem } from '../engine/FileSystem';

/**
 * The Command Interface
 * Ensures all commands share the same execution signature.
 */
export interface ICommand {
    execute(args: string[], fs: FileSystem): string;
}