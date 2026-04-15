
import { DirectoryNode, FileSystemNode } from '../core/Nodes';
import { WildcardResolver } from './WildcardResolver';

/**
 * Parses path strings and traverses the Node tree to find the target.
 */
export class PathResolver {
    private wildcardResolver: WildcardResolver;

    // Dependency Injection: Pass the wildcard resolver in via the constructor
    constructor(wildcardResolver: WildcardResolver) {
        this.wildcardResolver = wildcardResolver;
    }

    public resolve(base: DirectoryNode, pathStr: string, root: DirectoryNode): FileSystemNode | null {
        if (!pathStr) return base;

        // If path starts with '/', it's absolute. Start at root. Otherwise, start at base (cwd).
        let current: FileSystemNode = pathStr.startsWith('/') ? root : base;
        const parts = this.split(pathStr);

        for (const part of parts) {
            if (part === '.') continue; // Stay in current directory
            
            if (part === '..') {
                const parent = current.getParent();
                current = parent ? parent : current; // Go up, or stay if already at root
                continue;
            }

            // TRIGGER UNIQUE FEATURE
            if (part === '*') {
                if (!current.isDirectory()) return null;
                const nextDir = this.wildcardResolver.resolve(current as DirectoryNode, '*');
                
                // If no subdirectories exist, fallback to current directory
                if (!nextDir) return current; 
                current = nextDir;
                continue;
            }

            // Normal Traversal
            if (!current.isDirectory()) return null; // Can't traverse into a file
            const nextNode = (current as DirectoryNode).getChild(part);
            
            if (!nextNode) return null; // Broken path
            current = nextNode;
        }

        return current;
    }

    private split(path: string): string[] {
        // Removes empty strings caused by trailing slashes (e.g., 'a/b/' -> ['a', 'b'])
        return path.split('/').filter(p => p.length > 0);
    }
}