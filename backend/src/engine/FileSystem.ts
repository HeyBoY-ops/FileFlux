import { DirectoryNode, FileSystemNode } from '../core/Nodes';
import { PathResolver } from './PathResolver';
import { WildcardResolver } from './WildcardResolver';

/**
 * The core engine API. 
 * Provides high-level filesystem operations (mkdir, cd, ls).
 */
export class FileSystem {
    private root: DirectoryNode;
    private cwd: DirectoryNode; // Current Working Directory
    private pathResolver: PathResolver;
    private wildcardResolver: WildcardResolver;

    constructor() {
        this.root = new DirectoryNode('/');
        this.cwd = this.root;
        this.wildcardResolver = new WildcardResolver();
        this.pathResolver = new PathResolver(this.wildcardResolver);
    }

    // --- CORE OPERATIONS ---

    public mkdir(path: string): DirectoryNode {
        // Simplified for this tier: Creates a folder in the current directory.
        if (this.cwd.hasChild(path)) {
            throw new Error(`mkdir: cannot create directory '${path}': File exists`);
        }
        const newDir = new DirectoryNode(path);
        this.cwd.addChild(newDir);
        return newDir;
    }

    public cd(path: string): boolean {
        // 'cd' with no args usually goes to user home, we'll route to root
        if (!path) {
            this.cwd = this.root;
            return true;
        }

        const targetNode = this.pathResolver.resolve(this.cwd, path, this.root);
        
        if (!targetNode) {
            throw new Error(`cd: ${path}: No such file or directory`);
        }
        if (!targetNode.isDirectory()) {
            throw new Error(`cd: ${path}: Not a directory`);
        }

        this.cwd = targetNode as DirectoryNode;
        return true;
    }

    public pwd(): string {
        return this.cwd.getPath();
    }

    public ls(path?: string): FileSystemNode[] {
        const targetNode = path 
            ? this.pathResolver.resolve(this.cwd, path, this.root) 
            : this.cwd;
            
        if (!targetNode) {
            throw new Error(`ls: cannot access '${path}': No such file or directory`);
        }
        
        // If they ls a file, just return the file
        if (!targetNode.isDirectory()) {
            return [targetNode];
        }
        
        // Return contents of the directory
        return (targetNode as DirectoryNode).getChildren();
    }

    public getCwd(): DirectoryNode {
        return this.cwd;
    }
}