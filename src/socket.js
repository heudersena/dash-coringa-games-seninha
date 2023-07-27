import { reactive } from "vue";
import { io } from "socket.io-client";


export const state = reactive({
    connected: false,
    fooEvents: [],
    barEvents: []
});


const URL = "http://192.168.0.111:4008"

export const socket = io(URL, { autoConnect: true });

socket.on("connect", () => {
    state.connected = true;
});

socket.on("disconnect", () => {
    state.connected = false;
});
