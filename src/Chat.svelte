<script>
    //--------------------------------------------------------------------imports
    import { socket } from "./Variables.js";
    import { getContext, setContext, onMount } from "svelte";
    import { focuschat } from "./Class.js";
    //-------------------------------------------------------------------------------- variables
    export let chatcacher = true;

    let contenuchat = [];
    let joueur = getContext("joueur");
    let effet = [
        new Audio("son/effet/ambiance.mp3"),
        new Audio(""),
        new Audio("son/effet/chat2.mp3")
    ];
    //------------------------------------------------------------------------------------

    onMount(async () => {});

    function envoimessagechat(e) {
        /* console.log(e.target.value); */
        let message = e.target.value;
        let data = {
            text: message,
            id: joueur.pseudo
        };
        socket.emit("message", data);
        e.target.value = "";
        effet[2].volume = 0.1;
        effet[2].play();
    }

    socket.on("nouvelleconnexion", (data) => {
        contenuchat = data.contenuchat;
        console.log("un joueur s'est connecté");
    });
    socket.on("chatmaj", (data) => {
        if (data.id != joueur.pseudo) {
            effet[2].volume = 0.1;
            effet[2].play();
        }

        contenuchat = data.text;
    });
</script>

<svelte:window
    on:keydown={(event) => {
        if (event.key === "Escape") {
            console.log("echap appuyé");

            if (chatcacher === false) {
                chatcacher = true;
            }
        }
    }}
    on:mousemoove={() => {}}
/>

<div id="chat" class={chatcacher ? "menucache" : ""}>
    <input
        type="text"
        placeholder="chat"
        id="input2"
        maxlength="80"
        autocomplete="off"
        onfocus="this.placeholder=''"
        on:keydown={(e) => {
            if (e.key === "Enter") {
                envoimessagechat(e);
                console.log(e.target.value);
            }
            if (e.code === "Space") {
                console.log("space");

                e.target.value = e.target.value + " ";
            }
        }}
        on:focus={(e) => {
            console.log("focus");
            console.log(contenuchat);
            $focuschat = true;
            console.log($focuschat);
        }}
        on:blur={(e) => {
            console.log("focus perdu");
            $focuschat = false;
            console.log($focuschat);
        }}
    />
    <span
        id="fermer"
        on:click={() => {
            chatcacher = true;
        }}>X</span
    >
    <div id="containermessagechat">
        {#each contenuchat as contenuchat}
            <p class="messagedechat">{contenuchat}</p>
        {/each}
    </div>
</div>
<div>
    <img
        alt=""
        src="img/chat.png"
        on:click={() => {
            if (chatcacher === true) {
                chatcacher = false;
            } else {
                chatcacher = true;
            }
        }}
    />
</div>

<style>
    @font-face {
        font-family: "scifi";
        src: url("/conthrax-sb.ttf");
    }
    #chat {
        background-color: rgba(0, 0, 0, 0.623);
        width: 600px;
        height: 250px;
        position: absolute;
        z-index: 4;
        top: 80%;
        left: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000;
        margin: 0;
        padding: 6px;
        border: solid 1px rgb(0, 167, 179);
        box-sizing: border-box;
    }
    #chat > input {
        font-family: "Franklin Gothic Medium", Courier, monospace;
    }
    .menucache {
        display: none;
        cursor: initial;
        z-index: 0;
        margin-right: 333px;
    }
    img {
        z-index: 5;
        position: absolute;

        bottom: 125px;
        left: 30px;
        font-family: "scifi";
        display: initial;
        cursor: url("/img/mouse2.png"), pointer;
        color: rgb(246, 90, 0);
        width: 35px;
        border-radius: 9px;
        padding: 2px;
        font-size: 30px;
        text-shadow: 1px 1px 16px rgb(128, 0, 0);
        font-weight: 1900px;
    }
    img:hover {
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000;
    }
    .messagedechat {
        color: rgb(255, 255, 255);
        font-size: 13;
        line-height: 18px;
    }
    #containermessagechat {
        padding-top: 10px;
    }
    p {
        font-size: 12px;
        text-shadow: 1px 1px 9px rgb(0, 0, 0);
    }
    input {
        width: 70%;
        font-size: 15px;
        font-family: "scifi";
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000;
        background-color: rgb(39, 39, 39);
        outline: none;
        color: rgb(0, 199, 235);
        text-shadow: 0.4px 0.4px rgb(0, 0, 0);
    }
    input::placeholder {
        color: #000000;
    }
    #fermer {
        color: rgb(64, 64, 64);
        cursor: url("/img/mouse2.png"), pointer;
        margin-left: 20px;
        width: 20px;
        background-color: rgb(0, 0, 0);
        position: fixed;
        border-radius: 5px;
    }
    #fermer:hover {
        box-shadow: 0px 0px 6px rgb(255, 0, 0), 0px 0px 10px #000000;
        cursor: url("/img/mouse2.png"), pointer;
        color: red;
    }
</style>
