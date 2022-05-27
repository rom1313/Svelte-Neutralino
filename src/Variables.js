import { getContext, setContext } from "svelte";
import io from "socket.io-client";
export const socket = io("https://apiildaa.herokuapp.com");
export const sauvegarde = (joueur) => {

    socket.emit("sauvegarde", joueur);


}
// setContext("socket", socket);