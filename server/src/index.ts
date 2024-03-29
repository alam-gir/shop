import app from "./app";
import http from "http";
import { Server } from "socket.io";

const server = http.createServer(app);
export const io = new Server(server);

io.on("connection", (socket) => {
  console.log("a user connected");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
