import { io } from 'socket.io-client'

const Socket = io(process.env.REACT_APP_VER === "TEST" ? "localhost:5000" : window.origin)

export { Socket };