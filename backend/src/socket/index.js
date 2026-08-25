"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setupSocket;
const socket_io_1 = require("socket.io");
function setupSocket(io) {
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
}
//# sourceMappingURL=index.js.map