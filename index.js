import express from 'express';
import cors from 'cors';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;
const server = createServer(app);
const io = new Server(server);

const data = {
    gartic_url: 'https://garticphone.com/',
}

app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    const filePath = join(__dirname, 'index.html');
    const htmlContent = await readFile(filePath, 'utf-8');
    res.send(htmlContent);
});

app.post('/gartic_url', (req, res) => {
    const { url, password } = req.body;
    if (password != '8080') { return res.status(401).send({ message: 'Invalid password' });}
    if (url) {
        data.gartic_url = url;
        res.status(200).send({ message: 'URL updated successfully' });
    } else {
        res.status(400).send({ message: 'Invalid URL' });
    }
});

app.get('/gartic_url', (req, res) => {
    res.send({ gartic_url: data.gartic_url });
});

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado: ', socket.handshake.address);

    socket.on('chat message', (data) => {
        console.log(data, "by: ", socket.handshake.address);
        io.emit('chat message', data);
    });

    socket.on('disconnect', () => {
        console.log(socket.id, 'se ha desconectado');
        console.log('IP del usuario desconectado:', socket.handshake.address);
    });
});

server.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
