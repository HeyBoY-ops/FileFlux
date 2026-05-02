import 'dotenv/config'
import express, { Request, Response } from 'express';
import cors from 'cors';
import { FileSystem } from './src/engine/FileSystem';
import { CommandProcessor } from './src/shell/CommandProcessor';
import { TouchCommand } from './src/shell/commands/TouchCommand';
import { CatCommand } from './src/shell/commands/CatCommand';
import { EchoCommand } from './src/shell/commands/EchoCommand';
import { ClearCommand } from './src/shell/commands/ClearCommand';
import { RmCommand } from './src/shell/commands/RunCommand';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors()); // Allows your React app to talk to this server
app.use(express.json());

// 1. Initialize the Virtual File System in the server's RAM
const fs = new FileSystem();
const processor = new CommandProcessor(fs);
processor.register('touch', new TouchCommand());
processor.register('cat', new CatCommand());
processor.register('echo', new EchoCommand());
processor.register('clear', new ClearCommand());
processor.register('rm', new RmCommand());

// 2. The execution endpoint
app.post('/api/execute', (req: Request, res: Response) => {
    const { command } = req.body;

    if (!command) {
        return res.status(400).json({ error: 'No command provided' });
    }

    // Process the command using your existing logic
    const output = processor.process(command);

    // Return the result and the new path
    res.json({
        output: output,
        path: fs.pwd()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 FileFlux Engine running at http://localhost:${PORT}`);
});