const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const timeInArgentina = require('../utils/timeInArgentina.js');

const chatHistoryPath = path.join(__dirname, '../../../chatHistory.json');

const readChatHistory = () => {
    try {
        const data = fs.readFileSync(chatHistoryPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading chat history:', err);
        return [];
    }
};

const saveChatHistory = (chatHistory) => {
    fs.writeFile(chatHistoryPath, JSON.stringify(chatHistory, null, 2), (err) => {
        if (err) {
            console.error('Error saving chat history:', err);
        }
    });
};

let chatHistory = readChatHistory();

const setupSocket = (server) => {
    const io = socketIo(server);

    io.on('connection', (socket) => {
        socket.emit('chatHistory', chatHistory);

        socket.on('chatMessage', (msg) => {
            const message = {
                id: socket.id,
                name: msg.name,
                surname: msg.surname,
                text: msg.text,
                timestamp: timeInArgentina()
            };

            chatHistory.push(message);
            io.emit('chatMessage', message);
            saveChatHistory(chatHistory); 
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    return io;
};

module.exports = setupSocket;
