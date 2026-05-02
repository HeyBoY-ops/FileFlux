// Defining the Enum for the EntryType shown in the UML
export type EntryType = 'SUCCESS' | 'ERROR' | 'INFO';

/**
 * The Data Transfer Object (DTO) for a single terminal line.
 */
export interface HistoryEntry {
    path: string;
    command: string;
    output: string;
    timestamp: Date;
    type: EntryType;
}

/**
 * The Memory Bank
 * Stores the sequence of commands and outputs for the UI to render.
 */
export class TerminalHistory {
    private entries: HistoryEntry[] = [];

    public push(entry: HistoryEntry): void {
        this.entries.push(entry);
    }

    public clear(): void {
        this.entries = [];
    }

    public getAll(): HistoryEntry[] {
        // Return a shallow copy so the UI can't accidentally mutate the history array directly
        return [...this.entries];
    }
}