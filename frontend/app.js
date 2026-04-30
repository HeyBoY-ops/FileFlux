/**
 * app.js — Wires the FileSystem engine to the terminal UI.
 */

const fs = new FileSystem();

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const termBody   = document.getElementById('terminal-body');
const cmdInput   = document.getElementById('cmd-input');
const promptLabel = document.getElementById('prompt-label');
const infoCwd    = document.getElementById('info-cwd');
const treeRoot   = document.getElementById('tree-root');

// Command history (↑ / ↓ navigation)
let history     = [];
let historyIdx  = -1;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function updatePrompt() {
  const path = fs.pwd();
  promptLabel.textContent = `${path} $`;
  infoCwd.textContent     = path;
}

function scrollBottom() {
  termBody.scrollTop = termBody.scrollHeight;
}

function appendLine(html, cls = '') {
  const div = document.createElement('div');
  div.className = `output-line ${cls}`;
  div.innerHTML = html;
  termBody.appendChild(div);
  scrollBottom();
}

function appendCmd(raw) {
  appendLine(`<span class="prompt-echo">${escHtml(fs.pwd())} $</span>${escHtml(raw)}`, 'cmd');
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── Tree Renderer ────────────────────────────────────────────────────────────

function renderTree() {
  treeRoot.innerHTML = '';
  const cwdPath = fs.pwd();
  renderNode(fs.getRoot(), 0, cwdPath);
}

function renderNode(node, depth, cwdPath) {
  const div = document.createElement('div');
  div.className = 'tree-node' + (node.getPath() === cwdPath ? ' is-cwd' : '');
  div.style.paddingLeft = `${depth * 14}px`;

  const icon = document.createElement('span');
  icon.className = 'tree-icon';
  icon.textContent = depth === 0 ? '⬡' : (node.isDirectory() ? '▸' : '·');

  const name = document.createElement('span');
  name.className = 'tree-name';
  name.textContent = depth === 0 ? '/' : node.getName();

  div.appendChild(icon);
  div.appendChild(name);
  treeRoot.appendChild(div);

  if (node.isDirectory()) {
    const children = node.getChildren();
    // Dirs first, then files, both sorted alphabetically
    const dirs  = children.filter(c => c.isDirectory()).sort((a, b) => a.getName().localeCompare(b.getName()));
    const files = children.filter(c => !c.isDirectory()).sort((a, b) => a.getName().localeCompare(b.getName()));
    [...dirs, ...files].forEach(child => renderNode(child, depth + 1, cwdPath));
  }
}

// ─── Command Handlers ─────────────────────────────────────────────────────────

function handleHelp() {
  appendLine('Available commands:', 'info');
  const cmds = [
    ['mkdir &lt;name&gt;',  'Create a directory in the current directory'],
    ['cd &lt;path&gt;',     'Change directory (supports . / .. / * / absolute paths)'],
    ['ls [path]',           'List contents of current or given directory'],
    ['pwd',                 'Print current working directory'],
    ['clear',               'Clear terminal output'],
    ['help',                'Show this help message'],
  ];
  cmds.forEach(([cmd, desc]) => {
    appendLine(`  <code>${cmd}</code> — ${desc}`, 'info');
  });
}

function handleMkdir(args) {
  if (!args || !args.trim()) {
    appendLine('mkdir: missing operand', 'error');
    return;
  }
  const name = args.trim();
  try {
    fs.mkdir(name);
    appendLine(`Directory '${escHtml(name)}' created.`, 'result');
  } catch (e) {
    appendLine(escHtml(e.message), 'error');
  }
}

function handleCd(args) {
  const path = (args || '').trim();
  try {
    fs.cd(path || '');
    const newPath = fs.pwd();
    appendLine(`→ ${escHtml(newPath)}`, 'result');
  } catch (e) {
    appendLine(escHtml(e.message), 'error');
  }
}

function handlePwd() {
  appendLine(escHtml(fs.pwd()), 'result');
}

function handleLs(args) {
  const path = (args || '').trim();
  try {
    const nodes = fs.ls(path || undefined);
    if (nodes.length === 0) {
      appendLine('(empty directory)', 'info');
      return;
    }
    // Build a grid of items
    const grid = document.createElement('div');
    grid.className = 'ls-grid';

    const dirs  = nodes.filter(n => n.isDirectory()).sort((a, b) => a.getName().localeCompare(b.getName()));
    const files = nodes.filter(n => !n.isDirectory()).sort((a, b) => a.getName().localeCompare(b.getName()));

    [...dirs, ...files].forEach(node => {
      const span = document.createElement('span');
      span.className = 'ls-item';
      span.innerHTML = node.isDirectory()
        ? `▸ ${escHtml(node.getName())}/`
        : `· ${escHtml(node.getName())}`;
      grid.appendChild(span);
    });

    termBody.appendChild(grid);
    scrollBottom();
  } catch (e) {
    appendLine(escHtml(e.message), 'error');
  }
}

function handleClear() {
  // Keep only the first separator line
  while (termBody.children.length > 1) {
    termBody.removeChild(termBody.lastChild);
  }
}

// ─── Command Dispatcher ───────────────────────────────────────────────────────

function dispatch(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return;

  // Save to history
  history.unshift(trimmed);
  if (history.length > 100) history.pop();
  historyIdx = -1;

  appendCmd(trimmed);

  const spaceIdx = trimmed.indexOf(' ');
  const cmd  = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
  const args = spaceIdx === -1 ? ''      : trimmed.slice(spaceIdx + 1);

  switch (cmd.toLowerCase()) {
    case 'mkdir': handleMkdir(args); break;
    case 'cd':    handleCd(args);    break;
    case 'pwd':   handlePwd();       break;
    case 'ls':    handleLs(args);    break;
    case 'clear': handleClear();     return; // skip post-update separator
    case 'help':  handleHelp();      break;
    default:
      appendLine(`${escHtml(cmd)}: command not found. Type <code>help</code> for a list.`, 'error');
  }

  updatePrompt();
  renderTree();
}

// ─── Input Events ─────────────────────────────────────────────────────────────

cmdInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const val = cmdInput.value;
    cmdInput.value = '';
    dispatch(val);
    return;
  }

  // History navigation
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIdx < history.length - 1) {
      historyIdx++;
      cmdInput.value = history[historyIdx];
      // Move cursor to end
      setTimeout(() => cmdInput.setSelectionRange(cmdInput.value.length, cmdInput.value.length), 0);
    }
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIdx > 0) {
      historyIdx--;
      cmdInput.value = history[historyIdx];
    } else {
      historyIdx = -1;
      cmdInput.value = '';
    }
  }
});

// Keep focus on input when clicking anywhere in the terminal
termBody.addEventListener('click', () => cmdInput.focus());

// ─── Seed: Dummy directory tree ───────────────────────────────────────────────

/**
 * Builds a realistic folder structure silently (no terminal output per command).
 * Uses the FileSystem engine directly so no dispatch noise is shown.
 *
 * Tree:
 * /
 * ├── home/
 * │   ├── alice/
 * │   │   ├── documents/
 * │   │   │   ├── resume/
 * │   │   │   └── notes/
 * │   │   └── downloads/
 * │   └── bob/
 * │       ├── projects/
 * │       │   ├── alpha/
 * │       │   └── beta/
 * │       └── music/
 * ├── etc/
 * │   ├── config/
 * │   └── cron/
 * ├── usr/
 * │   ├── bin/
 * │   └── lib/
 * └── var/
 *     └── logs/
 */
function seedFilesystem() {
  const make = (path) => {
    const parts = path.replace(/^\//, '').split('/');
    fs.cd('/');
    for (const part of parts) {
      if (!fs.getCwd().hasChild(part)) {
        fs.mkdir(part);
      }
      fs.cd(part);
    }
    fs.cd('/');
  };

  const dirs = [
    '/home',
    '/home/alice',
    '/home/alice/documents',
    '/home/alice/documents/resume',
    '/home/alice/documents/notes',
    '/home/alice/downloads',
    '/home/bob',
    '/home/bob/projects',
    '/home/bob/projects/alpha',
    '/home/bob/projects/beta',
    '/home/bob/music',
    '/etc',
    '/etc/config',
    '/etc/cron',
    '/usr',
    '/usr/bin',
    '/usr/lib',
    '/var',
    '/var/logs',
  ];

  dirs.forEach(make);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

seedFilesystem();
updatePrompt();
renderTree();

appendLine('Dummy filesystem seeded. Try:', 'info');
appendLine('  <code>ls</code>  &nbsp;&nbsp; <code>cd home</code>  &nbsp;&nbsp; <code>cd home/alice/documents</code>  &nbsp;&nbsp; <code>cd *</code>', 'info');
appendLine('', 'separator');

cmdInput.focus();
