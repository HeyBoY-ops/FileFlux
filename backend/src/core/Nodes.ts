/**
 * The Abstract Component
 * This defines the common interface for all items in the filesystem.
 */
export abstract class FileSystemNode {
    protected name: string;
    protected parent: DirectoryNode | null;
    protected createdAt: Date;

    constructor(name: string, parent: DirectoryNode | null = null) {
        this.name = name;
        this.parent = parent;
        this.createdAt = new Date();
    }

    public getName(): string {
        return this.name;
    }

    public getPath(): string {
        if (!this.parent) return this.name === '/' ? '/' : `/${this.name}`;
        const parentPath = this.parent.getPath();
        return parentPath === '/' ? `/${this.name}` : `${parentPath}/${this.name}`;
    }

    public getParent(): DirectoryNode | null {
        return this.parent;
    }

    public setParent(parent: DirectoryNode | null): void {
        this.parent = parent;
    }

    abstract isDirectory(): boolean;
}

/**
 * The Leaf Node
 * Represents a file. It contains data but cannot contain other nodes.
 */
export class FileNode extends FileSystemNode {
    private content: string = "";
    private size: number = 0;

    public isDirectory(): boolean {
        return false;
    }

    public read(): string {
        return this.content;
    }

    public write(data: string): void {
        this.content = data;
        this.size = data.length; // Simple size calculation
    }

    public getSize(): number {
        return this.size;
    }
}

/**
 * The Composite Node
 * Represents a directory. It can contain both Files and other Directories.
 */
export class DirectoryNode extends FileSystemNode {
    private children: Map<string, FileSystemNode> = new Map();

    public isDirectory(): boolean {
        return true;
    }

    public addChild(node: FileSystemNode): void {
        if (this.hasChild(node.getName())) {
            throw new Error(`File or directory '${node.getName()}' already exists.`);
        }
        this.children.set(node.getName(), node);
        node.setParent(this);
    }

    public removeChild(name: string): boolean {
        return this.children.delete(name);
    }

    public getChild(name: string): FileSystemNode | undefined {
        return this.children.get(name);
    }

    public getChildren(): FileSystemNode[] {
        return Array.from(this.children.values());
    }

    public hasChild(name: string): boolean {
        return this.children.has(name);
    }
}