import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

/**
 * FileFlux: Professional Virtual File System Interface
 * Built by Mohan Kumar C R
 */
const FileFluxTerminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const inputBuffer = useRef('');

  useEffect(() => {
    if (!terminalRef.current) return;

    // 1. Terminal Configuration: Industrial Minimalist
    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: '"Fira Code", "JetBrains Mono", monospace',
      fontSize: 18,
      theme: {
        background: '#000000', // Pure Black
        foreground: '#ffffff', // High-contrast White
        cursor: '#3fb950',     // Classic Terminal Green
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;

    const PROMPT = '\x1b[1;32mguest@FileFlux:/$ \x1b[37m';
    const PROMPT_LENGTH = 18; // Length of "guest@FileFlux:/$ "

    term.write(PROMPT);

    // 2. Input Handling with Line Guard Logic
    term.onData(async (data) => {
      const code = data.charCodeAt(0);
      const cursorX = term.buffer.active.cursorX;

      if (code === 13) { // Enter Key
        const command = inputBuffer.current;
        term.write('\r\n');

        if (command.trim()) {
          await executeCommand(command, term);
        } else {
          term.write(PROMPT);
        }
        inputBuffer.current = '';

      } else if (code === 127) { // Backspace
        // GUARD: Only allow backspace if cursor is ahead of the prompt
        if (inputBuffer.current.length > 0 && cursorX > PROMPT_LENGTH) {
          inputBuffer.current = inputBuffer.current.slice(0, -1);
          term.write('\b \b');
        }

      } else if (code === 27) { // Potential Arrow Keys/Control Codes
        // Ignore for now to prevent users from navigating into history
        return;

      } else if (code >= 32) { // Standard printable characters
        inputBuffer.current += data;
        term.write(data);
      }
    });

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  const executeCommand = async (command: string, term: Terminal) => {
    try {
      // This line dynamically picks the right URL based on your environment
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

      const response = await fetch(`${API_BASE_URL}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });

      const data = await response.json();
      if (data.output) {
        term.write(data.output + '\r\n');
      }

      // Dynamic Path Update from Engine
      term.write(`\x1b[1;32mguest@FileFlux:${data.path || '/'}$ \x1b[37m`);
    } catch (err) {
      term.write('\x1b[31mError: Connection to FileFlux Engine lost.\x1b[37m\r\n');
      term.write('\x1b[1;32mguest@FileFlux:/$ \x1b[37m');
    }
  };

  return (
    <div style={{
      backgroundColor: '#000000',
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      padding: '40px', // Proper spacing from edges
      boxSizing: 'border-box',
      textAlign: 'left'
    }}>

      {/* Header Section */}
      <header style={{
        marginBottom: '30px',
        borderBottom: '1px solid #222',
        paddingBottom: '10px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '48px',
          color: '#58a6ff',
          fontWeight: 500
        }}>
          FileFlux
        </h1>
        <br />
        <p style={{
          margin: '5px 0 0 0',
          color: '#666',
          fontSize: '32px'
        }}>
          Virtual File System Engine
        </p>
      </header>

      {/* Main Content Area */}
      <main style={{ width: '100%', display: 'flex', flex: 1, gap: '30px', minHeight: 0 }}>
        
        {/* Terminal Section (75%) */}
        <div style={{ flex: 3, minWidth: 0 }}>
          <div
            ref={terminalRef}
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Sidebar Section (25%) */}
        <div style={{ 
          flex: 1, 
          borderLeft: '1px solid #222', 
          paddingLeft: '30px', 
          color: '#888',
          overflowY: 'auto' 
        }}>
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: '20px', 
            fontSize: '16px', 
            color: '#666', 
            textTransform: 'uppercase', 
            letterSpacing: '1px' 
          }}>
            Available Commands
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '2.5', fontSize: '15px' }}>
            <li><strong style={{ color: '#3fb950' }}>ls</strong> - List files and folders</li>
            <li><strong style={{ color: '#3fb950' }}>cd</strong> - Change directory</li>
            <li><strong style={{ color: '#3fb950' }}>mkdir</strong> - Create a folder</li>
            <li><strong style={{ color: '#3fb950' }}>touch</strong> - Create a file</li>
            <li><strong style={{ color: '#3fb950' }}>cat</strong> - Read file content</li>
            <li><strong style={{ color: '#3fb950' }}>echo</strong> - Print text to console</li>
            <li><strong style={{ color: '#3fb950' }}>pwd</strong> - Print working directory</li>
            <li><strong style={{ color: '#3fb950' }}>rm</strong> - Remove a file or folder</li>
            <li><strong style={{ color: '#3fb950' }}>clear</strong> - Wipe the cloud storage</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default FileFluxTerminal;