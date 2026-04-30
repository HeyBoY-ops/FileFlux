/**
 * fs.js — Browser port of the FileFlux backend engine.
 * Mirrors: Nodes.ts, WildcardResolver.ts, PathResolver.ts, FileSystem.ts
 * No dependencies. Runs entirely in the browser.
 */

// ─── Nodes ────────────────────────────────────────────────────────────────────

class FileSystemNode {
  constructor(name, parent = null) {
    this.name = parent === null && name !== '/' ? name : name;
    this._name   = name;
    this._parent = parent;
    this._createdAt = new Date();
  }

  getName()   { return this._name; }
  getParent() { return this._parent; }
  setParent(p){ this._parent = p; }

  getPath() {
    if (!this._parent) return this._name === '/' ? '/' : `/${this._name}`;
    const pp = this._parent.getPath();
    return pp === '/' ? `/${this._name}` : `${pp}/${this._name}`;
  }

  isDirectory() { throw new Error('abstract'); }
}

class FileNode extends FileSystemNode {
  constructor(name, parent = null) {
    super(name, parent);
    this._content = '';
    this._size    = 0;
  }
  isDirectory() { return false; }
  read()        { return this._content; }
  write(data)   { this._content = data; this._size = data.length; }
  getSize()     { return this._size; }
}

class DirectoryNode extends FileSystemNode {
  constructor(name, parent = null) {
    super(name, parent);
    this._children = new Map();
  }
  isDirectory()        { return true; }
  addChild(node)       { this._children.set(node.getName(), node); node.setParent(this); }
  removeChild(name)    { return this._children.delete(name); }
  getChild(name)       { return this._children.get(name); }
  getChildren()        { return Array.from(this._children.values()); }
  hasChild(name)       { return this._children.has(name); }
}

// ─── WildcardResolver ─────────────────────────────────────────────────────────

class WildcardResolver {
  resolve(dir, pattern) {
    if (pattern !== '*') return null;
    const dirs = dir.getChildren().filter(n => n.isDirectory());
    return this._getLexSmallest(dirs);
  }

  _getLexSmallest(dirs) {
    if (dirs.length === 0) return null;
    return [...dirs].sort((a, b) => a.getName().localeCompare(b.getName()))[0];
  }
}

// ─── PathResolver ─────────────────────────────────────────────────────────────

class PathResolver {
  constructor(wildcardResolver) {
    this._wc = wildcardResolver;
  }

  resolve(base, pathStr, root) {
    if (!pathStr) return base;

    let current = pathStr.startsWith('/') ? root : base;
    const parts = pathStr.split('/').filter(p => p.length > 0);

    for (const part of parts) {
      if (part === '.') continue;

      if (part === '..') {
        const parent = current.getParent();
        current = parent ? parent : current;
        continue;
      }

      if (part === '*') {
        if (!current.isDirectory()) return null;
        const next = this._wc.resolve(current, '*');
        if (!next) return current; // no subdirs → stay
        current = next;
        continue;
      }

      if (!current.isDirectory()) return null;
      const next = current.getChild(part);
      if (!next) return null;
      current = next;
    }

    return current;
  }
}

// ─── FileSystem ───────────────────────────────────────────────────────────────

class FileSystem {
  constructor() {
    this._root = new DirectoryNode('/');
    this._cwd  = this._root;
    this._wc   = new WildcardResolver();
    this._pr   = new PathResolver(this._wc);
  }

  /** mkdir <name> — creates a directory in cwd */
  mkdir(name) {
    if (!name || name.includes('/')) {
      throw new Error(`mkdir: invalid name '${name}'`);
    }
    if (this._cwd.hasChild(name)) {
      throw new Error(`mkdir: cannot create directory '${name}': File exists`);
    }
    const dir = new DirectoryNode(name);
    this._cwd.addChild(dir);
    return dir;
  }

  /** cd <path> — change directory */
  cd(path) {
    if (!path) {
      this._cwd = this._root;
      return true;
    }
    const target = this._pr.resolve(this._cwd, path, this._root);
    if (!target) {
      throw new Error(`cd: ${path}: No such file or directory`);
    }
    if (!target.isDirectory()) {
      throw new Error(`cd: ${path}: Not a directory`);
    }
    this._cwd = target;
    return true;
  }

  /** pwd — returns current path string */
  pwd() {
    return this._cwd.getPath();
  }

  /** ls [path] — returns array of FileSystemNode */
  ls(path) {
    const target = path
      ? this._pr.resolve(this._cwd, path, this._root)
      : this._cwd;

    if (!target) {
      throw new Error(`ls: cannot access '${path}': No such file or directory`);
    }
    if (!target.isDirectory()) return [target];
    return target.getChildren();
  }

  getCwd()  { return this._cwd; }
  getRoot() { return this._root; }
}
