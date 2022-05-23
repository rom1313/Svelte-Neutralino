import { getContext, setContext } from "svelte";
import io from "socket.io-client";
export const socket = io("http://localhost:3000");
export const sauvegarde = (joueur) => {

    socket.emit("sauvegarde", joueur);


}
// setContext("socket", socket);