import { DirectoryNode } from '../core/Nodes';

/**
 * Handles specialized deterministic wildcard logic.
 * Responsibility: Find the lexicographically smallest directory.
 */
export class WildcardResolver {
    
    public resolve(dir: DirectoryNode, pattern: string): DirectoryNode | null {
        //only support the global '*' pattern
        if (pattern !== '*') return null; 

        const children = dir.getChildren();

        const directories = children.filter(node => node.isDirectory()) as DirectoryNode[];

        return this.getLexSmallest(directories);
    }

    public getLexSmallest(dirs: DirectoryNode[]): DirectoryNode | null {
        if (dirs.length === 0) return null;

        const sortedDirs = [...dirs].sort((a, b) => a.getName().localeCompare(b.getName()));
        
        return sortedDirs[0]; 
    }
}