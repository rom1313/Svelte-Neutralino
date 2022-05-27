<script>
    import { socket } from "./Variables.js";
    import { getContext, setContext } from "svelte";

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
        joueur
    } from "./Class.js";

    let menucacher = true;
    let message;
    let resultatenvoi;
    let envoyer = false;
</script>

<svelte:window
    on:keydown={(event) => {
        if (event.key === "Escape") {
            if (menucacher === false) {
                effetui.fermer.volume = 0.1;
                effetui.fermer.play();
                menucacher = true;
            }
        }
    }}
/>
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<p
    id="contactboutton"
    on:click={(e) => {
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
>
    Contact
</p>
{#if !menucacher}
    <div id="blockformulaire">
        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
        <span
            id="fermer"
            on:click={(e) => {
                effetui.fermer.volume = 0.1;
                effetui.fermer.play();
                menucacher = true;
            }}
            on:mouseover={() => {
                effetui.hover.volume = 0.1;
                effetui.hover.play();
            }}>X</span
        >
        <p>Un soucis avec votre compte ?</p>
        <p>Un bug gênant ?</p>
        <p>Une idée pour améliorer le jeu ?</p>
        <p>Créez votre ticket !</p>
        <textarea
            on:keydown={(e) => {
                if (e.code === "Space") {
                    console.log("space");

                    e.target.value = e.target.value + " ";
                }
            }}
            on:keydown={(e) => {
                message = e.target.value;
                console.log(message);
            }}
            on:focus={(e) => {
                effetui.selection.volume = 0.1;
                effetui.selection.play();
                $focuschat = true;
                e.target.placeholder = "";
            }}
            on:blur={(e) => {
                $focuschat = false;
            }}
            placeholder="Votre message... 🖊

Rédigez un roman si vous le souhaitez, exprimez-vous ! 🙊

Pour être contacté, laissez votre e-mail en fin de message. "
            cols="30"
        />
        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
        <p
            id="button"
            on:click={(e) => {
                effetui.valider.volume = 0.1;
                effetui.valider.play();
                e.target.style.visibility = "hidden";

                let data = {
                    pseudo: $joueur.pseudo,
                    mess: message
                };
                socket.emit("mail", data);
                socket.on("mailresult", (data) => {
                    if (data === "ok") {
                        resultatenvoi = "Mail envoyé avec succès !";
                        envoyer = true;
                        effetui.notif.volume = 0.1;
                        effetui.notif.play();
                        setTimeout(() => {
                            envoyer = false;
                            menucacher = true;
                        }, 3000);
                    } else if (data === "error") {
                        resultatenvoi = "Il y a eu une erreur..";
                        envoyer = true;
                        effetui.error.volume = 0.1;
                        effetui.error.play();
                        setTimeout(() => {
                            envoyer = false;
                            menucacher = true;
                        }, 3000);
                    }
                });
            }}
            on:mouseover={() => {
                effetui.hover.volume = 0.1;
                effetui.hover.play();
            }}
        >
            Envoyer
        </p>
        {#if envoyer}
            <p id="resultat">{resultatenvoi}</p>{/if}
    </div>
{/if}

<style>
    @font-face {
        font-family: "scifi";
        src: url("/conthrax-sb.ttf");
    }
    #blockformulaire {
        height: 650px;
        width: 500px;
        background-color: rgb(30, 30, 30);
        border: solid 1px aqua;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 15px;
        padding: 10px;
        z-index: 6;
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000;
    }
    textarea {
        resize: none;
        height: 430px;
        width: 390px;
        position: fixed;
        top: 60%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 25px;
        z-index: 5;
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000 inset;
        border-radius: 15px;
        outline: none;
    }
    #button {
        position: absolute;
        top: 94%;
        left: 50%;
        transform: translate(-50%, -50%);
        cursor: url("/img/mouse2.png"), pointer;
        background-color: #000000;
        font-size: 15px;
        color: white;
        width: 120px;
        height: 20px;
        border-radius: 15px;
        z-index: 3;
    }
    #button:hover {
        color: rgb(255, 0, 251);
        box-shadow: 0px 0px 10px rgb(0, 0, 0), rgb(255, 0, 251);
    }
    p {
        color: white;
        font-size: 15px;
        text-shadow: 1px 1px 16px rgb(0, 0, 0);
        font-weight: 600;
    }
    #fermer {
        color: rgb(64, 64, 64);
        cursor: url("/img/mouse2.png"), pointer;
        right: 15px;
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
    #contactboutton {
        color: white;
        cursor: url("/img/mouse2.png"), pointer;
        font-family: "scifi";
        text-shadow: 1px 1px 16px rgb(0, 0, 0);
    }
    #contactboutton:hover {
        color: rgb(255, 0, 251);
        transform: scale(1.1);
        text-shadow: 1px 1px 16px rgb(0, 0, 0);
    }
    #resultat {
        position: absolute;

        top: 94%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
</style>
