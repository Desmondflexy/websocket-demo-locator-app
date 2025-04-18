import express from 'express';
import { createServer } from 'http';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { connectWebSocket } from './socket.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
app.use(express.static(join(__dirname, "../public")));


const port = 3000;
server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});

connectWebSocket(server);