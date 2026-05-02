import 'dotenv/config'
import express, { Request, Response } from 'express';
import cors from 'cors';
import { FileSystem } from './src/engine/FileSystem';
import { CommandProcessor } from './src/shell/CommandProcessor';
import { TouchCommand } from './src/shell/commands/TouchCommand';
import { CatCommand } from './src/shell/commands/CatCommand';
import { EchoCommand } from './src/shell/commands/EchoCommand';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// 1. Define the structure for a user's isolated session
interface SessionData {
    fs: FileSystem;
    processor: CommandProcessor;
}

// 2. The Master Brain: Holds all active playgrounds in RAM
const activeSessions: Record<string, SessionData> = {};

// Health Check Route for Render
app.get('/', (req: Request, res: Response) => {
    res.status(200).send('FileFlux Engine is Online and Ready.');
});

// 3. The Execution Endpoint
app.post('/api/execute', (req: Request, res: Response) => {
    // Extract both the command and the unique ID sent from the React frontend
    const { command, sessionId } = req.body;

    if (!command) {
        return res.status(400).json({ error: 'No command provided' });
    }

    // Security check: Ensure frontend is passing the ID
    if (!sessionId) {
        return res.status(400).json({ error: 'No sessionId provided. Connection rejected.' });
    }

    // 4. If this is a brand new user, build their isolated engine
    if (!activeSessions[sessionId]) {
        const userFs = new FileSystem();
        const userProcessor = new CommandProcessor(userFs);

        userProcessor.register('touch', new TouchCommand());
        userProcessor.register('cat', new CatCommand());
        userProcessor.register('echo', new EchoCommand());

        // Save it to the master dictionary
        activeSessions[sessionId] = {
            fs: userFs,
            processor: userProcessor
        };

        console.log(`[+] New Session Created: ${sessionId}`);
    }

    // 5. Grab this specific user's engine components
    const userSession = activeSessions[sessionId];

    // Process the command safely isolated from everyone else
    const output = userSession.processor.process(command);

    // Return the result and the user's specific path
    res.json({
        output: output,
        path: userSession.fs.pwd()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 FileFlux Engine running at http://localhost:${PORT}`);
});