<script>
    //--------------------------------------------------------------------imports
    import { socket } from "./Variables.js";
    import { getContext, setContext, onMount } from "svelte";
    import {
        Allier,
        Personnage,
        Objet,
        chatouvert,
        Etats,
        focuschat,
        volume,
        pause,
        effetui,
        effetarme,
        contenuchat,
        nbjoueursenligne,
        joueursenligne
    } from "./Class.js";
    $: chatfinal = chat;
    //-------------------------------------------------------------------------------- variables

    export let menucacher = true;
    let chat = [];
    let joueur = getContext("joueur");
    let nomjoueursouvert = false;
    let nomamisouvert = false;
    let notifsilence = false;
    //------------------------------------------------------------------------------------

    function envoimessagechat(e) {
        /* console.log(e.target.value); */
        let message = e.target.value;
        let data = {
            text: message,
            id: joueur.pseudo
        };
        socket.emit("message", data);
        e.target.value = "";
    }

    function traitementcontenuchat(contenuchat) {
        if (contenuchat != [] || contenuchat != undefined) {
            chat = [];
            let nom;
            let text;
            let elem = [];
            contenuchat.forEach((element) => {
                let i = 0;

                nom = element.split(":")[0];
                text = element.split(":")[1];
                let objet = {
                    pseudo: nom,
                    text: text
                };
                chat.push(objet);

                console.log(chat);
            });
        }
    }
    traitementcontenuchat($contenuchat);

    socket.on("nouvelleconnexion", (data) => {
        console.log(data.contenuchat);
        $contenuchat = data.contenuchat;
        console.log("un joueur s'est connecté");
    });
    socket.on("chatmaj", (data) => {
        if (data.id != joueur.pseudo && notifsilence != true) {
            effetui.chat.volume = 0.1;
            effetui.chat.play();
        }

        $contenuchat = data.text;
        traitementcontenuchat($contenuchat);
    });
    console.log($contenuchat);
</script>

<svelte:window
    on:keydown={(event) => {
        if (event.key === "s" || event.key === "S") {
            if (!$focuschat === true && menucacher === true) {
                effetui.selection.volume = 0.1;
                effetui.selection.play();
                menucacher = false;
            } else if (!$focuschat === true && menucacher === false) {
                effetui.fermer.volume = 0.1;
                effetui.fermer.play();
                menucacher = true;
            }
        } else if (event.key === "Escape" && menucacher === false) {
            effetui.fermer.volume = 0.1;
            effetui.fermer.play();
            menucacher = true;
        }
    }}
    on:mousemoove={() => {}}
/>
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<img
    src="img/chat.png"
    alt=""
    id="bouttonsocial"
    on:click={() => {
        if (menucacher) {
            effetui.selection.volume = 0.1;
            effetui.selection.play();
            menucacher = false;
        } else {
            effetui.fermer.volume = 0.1;
            effetui.fermer.play();
            menucacher = true;
        }
    }}
    on:mouseover={() => {
        effetui.hover.volume = 0.1;
        effetui.hover.play();
    }}
/>
{#if !menucacher}
    <div id="chat">
        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
        <span
            id="fermer"
            on:click={() => {
                effetui.fermer.volume = 0.1;
                effetui.fermer.play();
                menucacher = true;
            }}
            on:mouseover={() => {
                effetui.hover.volume = 0.1;
                effetui.hover.play();
            }}>X</span
        >
        <img
            id="cloche"
            src="img/cloche.png"
            alt=""
            on:click={(e) => {
                if (notifsilence) {
                    effetui.selection.volume = 0.1;
                    effetui.selection.play();
                    notifsilence = false;
                    e.target.src = "img/cloche.png";
                } else {
                    effetui.selection.volume = 0.1;
                    effetui.selection.play();
                    notifsilence = true;
                    e.target.src = "img/clochesilence.png";
                }
            }}
        />
        <div id="blocknbjoueur">
            <p><span id="nbligne">En ligne : </span>{$nbjoueursenligne}</p>
        </div>
        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
        <button
            id="bouttonliste"
            on:click={() => {
                if (nomjoueursouvert) {
                    effetui.fermer.volume = 0.1;
                    effetui.fermer.play();
                    nomjoueursouvert = false;
                } else {
                    effetui.selection.volume = 0.1;
                    effetui.selection.play();
                    nomjoueursouvert = true;
                    nomamisouvert = false;
                }
            }}
            on:mouseover={() => {
                effetui.hover.volume = 0.1;
                effetui.hover.play();
            }}>Joueurs</button
        >
        {#if nomjoueursouvert}
            <div id="blocknomjoueurenligne">
                {#each $joueursenligne as item}
                    <p id="nomjoueurenligne">
                        {item} <span style="font-size: 15">+</span> <span>?</span>
                    </p>
                {/each}
            </div>
        {/if}

        {#if nomamisouvert}
            <div id="blockamis">
                {#each joueur.amis as item}
                    <p>{item}</p>
                {/each}
            </div>
        {/if}

        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
        <button
            id="bouttonamis"
            on:click={() => {
                if (nomamisouvert) {
                    effetui.fermer.volume = 0.1;
                    effetui.fermer.play();
                    nomamisouvert = false;
                } else {
                    effetui.selection.volume = 0.1;
                    effetui.selection.play();
                    nomamisouvert = true;
                    nomjoueursouvert = false;
                }
            }}
            on:mouseover={() => {
                effetui.hover.volume = 0.1;
                effetui.hover.play();
            }}>Amis</button
        >
        <div id="blockchat">
            <img id="fondsocial" src="img/fondsocial.png" alt="" />
            <input
                type="text"
                placeholder="chat"
                id="input2"
                maxlength="100"
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
                    effetui.selection.volume = 0.1;
                    effetui.selection.play();
                    $focuschat = true;
                }}
                on:blur={(e) => {
                    $focuschat = false;
                }}
            />
            {#each chatfinal as contenu, i}
                {#if contenu.pseudo === joueur.pseudo}
                    <p class="chattext">
                        <span id="pseudojoueur">{contenu.pseudo} : </span>
                        {contenu.text}
                        {joueur.pseudo}
                    </p>
                {/if}
                {#if contenu.pseudo != joueur.pseudo}
                    <p class="chattext">
                        <span id="pseudoamis">{contenu.pseudo} : </span>
                        {contenu.text}
                    </p>
                {/if}
            {/each}
        </div>
    </div>
{/if}

<style>
    #bouttonsocial {
        position: absolute;
        top: 30px;
        cursor: url("/img/mouse2.png"), pointer;
        left: 50px;
    }
    #bouttonsocial:hover {
    }
    #chat {
        position: absolute;
        top: 70%;
        left: 50%;
        transform: translate(-50%, -50%);

        display: flex;
        justify-content: center;
        width: 600px;
        height: 400px;
        padding: 10px;
    }
    #blockchat {
        display: flex;
        position: relative;
        line-height: 18px;
        width: 720px;
        height: 380px;
        margin: 5px;

        flex-direction: column;
        align-items: center;
        box-sizing: border-box;
        overflow: hidden;
        padding: 5px;
        border: solid black 1px;
        border-radius: 15px;
        box-shadow: 0px 0px 10px rgb(0, 0, 0);
    }
    #pseudojoueur {
        color: blue;
        color: rgb(255, 170, 0);
        background-color: black;
        border-radius: 15px;
        padding: 3px;
        margin-right: 5px;
    }
    #pseudoamis {
        color: rgb(255, 170, 0);
        background-color: black;
        border-radius: 15px;
        padding: 3px;
        margin-right: 5px;
        font-size: 11px;
    }

    .chattext {
        margin: 7px;
        line-height: 25px;
        text-shadow: 1px 1px 16px rgb(85, 0, 102);
        color: bisque;
    }
    input {
        margin-bottom: 35px;
        background-color: #000000;
        outline: none;
        color: rgb(198, 0, 247);
    }
    #fermer {
        color: rgb(64, 64, 64);
        right: 29px;
        top: 33px;
        cursor: url("/img/mouse2.png"), pointer;
        margin-left: 20px;
        width: 20px;
        background-color: rgb(0, 0, 0);
        position: absolute;
        border-radius: 5px;
        z-index: 2;
    }
    #fermer:hover {
        box-shadow: 0px 0px 6px rgb(255, 0, 0), 0px 0px 10px #000000;
        cursor: url("/img/mouse2.png"), pointer;
        color: red;
    }
    #blocknbjoueur {
        position: absolute;
        top: 18px;
        left: 35px;
        color: rgb(198, 0, 247);
        font-size: 15px;
        text-shadow: 1px 1px 16px rgb(85, 0, 102);
    }
    #bouttonliste,
    #bouttonamis {
        position: absolute;
        top: 0px;
        font-size: 9px;
        background-color: black;
        color: rgb(198, 0, 247);
        text-shadow: 1px 1px 16px rgb(85, 0, 102);
        border-radius: 10px;
        cursor: url("/img/mouse2.png"), pointer;
        padding: 1px;
        outline: none;
    }
    #bouttonliste:hover,
    #bouttonamis:hover {
        box-shadow: 0px 0px 10px rgb(217, 0, 152);
    }
    #bouttonliste {
        left: 30px;
    }
    #bouttonamis {
        left: 70px;
    }
    #nbligne {
        font-size: 10px;
        color: rgb(255, 170, 0);
        text-shadow: 1px 1px 16px rgb(201, 70, 0);
    }
    #nomjoueurenligne {
        color: white;
        font-size: 9px;
    }
    #blocknomjoueurenligne {
        background-color: rgb(0, 0, 0);
        width: 100px;
        height: 200px;
        overflow: scroll;
        display: flex;
        flex-direction: column;
        top: 40px;
        position: absolute;
        left: -90px;
        border-radius: 5px;
        box-shadow: 0px 0px 10px rgb(0, 0, 0);
    }
    #blockamis {
        background-color: rgb(0, 0, 0);
        width: 100px;
        height: 200px;
        overflow: scroll;
        display: flex;
        flex-direction: column;
        top: 40px;
        position: absolute;
        left: -90px;
        border-radius: 5px;
        box-shadow: 0px 0px 10px rgb(0, 0, 0);
    }
    #fondsocial {
        position: absolute;
        z-index: -1;
        border-radius: 15px;
        border: solid black 1px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    #cloche {
        position: absolute;
        top: 23px;
        right: 190px;
        transform: scale(0.75);
        z-index: 2;
    }
    #cloche:hover {
        cursor: url("/img/mouse2.png"), pointer;
    }
    ::-webkit-scrollbar {
        width: 3px;
        border: solid 1px black;
        background: rgb(0, 0, 0);
    }
    ::-webkit-scrollbar-track {
        box-shadow: inset 0 0 5px rgb(0, 0, 0);
        border-radius: 5px;
    }
    ::-webkit-scrollbar-thumb {
        background: rgb(131, 0, 0);
        border-radius: 5px;
        box-shadow: inset 0 0 9px rgb(0, 0, 0);
        cursor: url("/img/mouse2.png"), pointer;
    }
    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
        background: #ff0000;
        box-shadow: inset 0 0 9px rgb(0, 0, 0);
    }
</style>
