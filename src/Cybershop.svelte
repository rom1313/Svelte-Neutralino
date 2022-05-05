<script>
    import { element } from "svelte/internal";
    import Cybershop from "./Cybershop.svelte";
    import { getContext, setContext } from "svelte";
    import { onMount } from "svelte";
    import { socket } from "./Variables.js";
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
        effetambiance,
        effetsprite,
        directionsprite,
        nbjoueursenligne,
        joueursenligne,
        contenuchat
    } from "./Class.js";

    let detailobjetouvert = false;
    let cybershopouvert = false;
    let joueur = getContext("joueur");
    let faucher = false;

    let voix = [
        new Audio("son/effet/ildaaconnexioncybershop.mp3"),
        new Audio("son/effet/ildaaafaucher.mp3")
    ];
    let pointerx;
    let pointery;
    let info;
    let cybershop = [];
    $: cybershopcontenu = cybershop;
    export let cyberz;
    socket.on("listemarchenoir", (data) => {
        console.log("données recu = " + data);
        cybershop = [];
        data.forEach((element) => {
            console.log(element);
            for (const [key, value] of Object.entries(element)) {
                let nom = value[0];
                let objet = value[1];
                let produit = { nom: nom, objet: objet };
                cybershop.push(produit);
                console.log(cybershop);
            }
        });
        /* console.log(joueuramis); */
    });
    onMount(async () => {
        socket.emit("cocybershop");
    });
</script>

<div id="block">
    <img
        src="img/cybershop.png"
        id="logo"
        alt=""
        on:click={() => {
            if (cybershopouvert === false) {
                socket.emit("cocybershop");
                voix[0].play();
                cybershopouvert = true;
            } else {
                cybershopouvert = false;
            }
        }}
    />
</div>
{#if cybershopouvert}
    <div id="cybershop">
        <img id="fond" src="img/profil2.png" alt="" />
        <span
            id="span"
            on:click={() => {
                cybershopouvert = false;
            }}
            >X
        </span>
        <img id="cybershoptitre" alt="" src="img/cybershop.png" />
        <p
            id="listemarchenoir"
            on:click={() => {
                socket.emit("cocybershop");
                console.log("connexion au marché noir");
                cybershopouvert = false;
                setTimeout(() => {
                    cybershopouvert = true;
                }, 2000);
            }}
        >
            Actualiser
        </p>

        <div id="marchenoir">
            <div id="blockcybershopobjet">
                {#each cybershop as objet, i}
                    <div id="blockobjet">
                        <img id="fondobjets" src="img/fondcybershopobjet.png" alt="" />
                        <p id="nomproduit">
                            {objet.nom}
                        </p>
                        <p id="nomobjet">
                            {objet.objet.nom}
                        </p>

                        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                        <img
                            tooltip="Some text you like"
                            id="objet"
                            src={objet.objet.img}
                            alt=""
                            on:mouseover={(event) => {
                                detailobjetouvert = true;

                                info = objet.objet.description;
                                console.log(objet);

                                pointerx = event.x;
                                pointery = event.y;
                            }}
                            on:mouseout={(event) => {
                                detailobjetouvert = false;
                            }}
                        />
                        <p><span id="prixobjet"> {objet.objet.prix * 4}</span></p>
                        <button
                            id="acheter"
                            on:click={() => {
                                let data = {
                                    pseudovendeur: objet.nom,
                                    nomproduit: objet.objet.nom
                                };
                                socket.emit("achatcybershop", data);

                                let objetacheter = new Objet(
                                    objet.objet.nom,
                                    objet.objet.prix,
                                    objet.objet.img,
                                    objet.objet.type,
                                    objet.objet.description,
                                    objet.objet.effet,
                                    objet.objet.createur,
                                    objet.objet.qualite,
                                    objet.objet.materiauxonix,
                                    objet.objet.materiauxchimique
                                );

                                joueur.inventaire.push(objetacheter);
                                socket.emit("cocybershop");
                            }}>Acheter</button
                        >
                    </div>
                {/each}
            </div>
        </div>
        <p id="cyberz"><span id="credits">Crédits :</span> {cyberz}</p>
        <p id="nbobjets">Objets en ventes : {cybershop.length}</p>
    </div>
    {#if detailobjetouvert}{/if}
{/if}

<style>
    @keyframes clignotement {
        from {
            opacity: 0.5;
        }
        to {
            opacity: 1;
        }
    }
    @keyframes animprix {
        from {
            color: rgb(189, 0, 206);
        }
        to {
            color: rgb(247, 0, 255);
        }
    }
    #detailsobjets {
        background-color: brown;
        position: absolute;
        width: 50px;
        height: 45px;
    }
    #credits {
        color: white;
    }
    #prixobjet {
        color: rgb(198, 0, 247);
        border: solid 1px black;
        text-shadow: 1px 1px 16px rgb(0, 0, 0);
        border-radius: 15px;
        font-size: 12px;
        padding-left: 5px;
        padding-right: 5px;
        animation: animprix infinite ease alternate 2s;
        box-shadow: 0px 0px 10px rgb(0, 0, 0) inset;
        margin-top: 3px;
        margin-bottom: 5px;
    }
    #fondobjets {
        position: absolute;
        z-index: 0;
        border-radius: 15px;
    }
    #nomobjet {
        color: white;
        margin-bottom: 12px;
        z-index: 2;
    }
    #objet {
        background-color: rgb(71, 71, 71);
        border-radius: 45px;
        border: solid 1px black;
        z-index: 2;
        box-shadow: 0px 0px 10px rgb(0, 0, 0) inset;
    }
    #objet:hover {
        box-shadow: 0px 0px 5px rgb(255, 187, 0), 0px 0px 10px #000000 inset;
    }
    #objetdescription {
        font-size: 8px;
        margin: 0%;
        margin-bottom: 8px;
        z-index: 2;
        line-height: 11px;
    }
    #acheter {
        cursor: url("/img/mouse2.png"), pointer;
        background-color: black;
        color: rgb(0, 204, 240);
        border-radius: 45px;
        border: none;
        margin-top: 7px;
        z-index: 2;
    }
    #acheter:hover {
        box-shadow: 0px 0px 10px rgb(255, 0, 0);
        color: rgb(255, 0, 0);
    }
    #nbobjets {
        position: absolute;
        bottom: 4px;
        font-size: 15px;
        color: chartreuse;
        left: 15px;
    }
    #cybershoptitre {
        position: absolute;
        top: -7px;
        left: 50%;
        transform: translateX(-50%);
    }
    #blockcybershopobjet {
        position: absolute;
        top: -25px;
        background-color: rgb(0, 0, 0);
        z-index: 6;
        overflow: scroll;
        width: 1000px;
        height: 560px;
        display: grid;
        grid-template-rows: 180px 180px 180px 180px 180px;
        grid-template-columns: 191px 191px 191px 191px 191px;
        column-gap: 4px;
        border-radius: 10px;
    }
    /* width */
    ::-webkit-scrollbar {
        width: 20px;
        border: solid 1px black;
        background: rgb(0, 0, 0);
    }
    /* Track */
    ::-webkit-scrollbar-track {
        box-shadow: inset 0 0 5px rgb(0, 0, 0);
        border-radius: 5px;
    }
    /* Handle */
    ::-webkit-scrollbar-thumb {
        background: rgb(104, 104, 104);
        border-radius: 5px;
        box-shadow: inset 0 0 9px rgb(0, 0, 0);
        cursor: url("/img/mouse2.png"), pointer;
    }
    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
        background: #7a7a7a;
        box-shadow: inset 0 0 9px rgb(0, 0, 0);
    }
    #blockobjet {
        background-color: rgb(0, 0, 0);
        border: solid 1px rgb(0, 0, 0);
        width: 195px;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 180px;
        margin: auto;
    }
    #nomproduit {
        margin-top: 5px;
        z-index: 5;
        cursor: url("/img/mouse2.png"), pointer;
        background-color: black;
        color: rgb(255, 255, 255);
        font-size: 10px;
        padding: 3px;
        border-radius: 45px;
        box-shadow: 0px 0px 7px rgb(0, 247, 255), 0px 0px 10px #000000;
    }
    #listemarchenoir {
        z-index: 5;
        cursor: url("/img/mouse2.png"), pointer;
        position: absolute;
        top: 17px;
        color: yellow;
        left: 9px;
        font-size: 16px;
    }
    #listemarchenoir:hover {
        text-shadow: 1px 1px rgb(241, 76, 0);
    }
    #choixmarchand {
        top: 168px;
        z-index: 5;
    }
    #cyberz {
        position: absolute;
        bottom: -23px;
        left: 580px;
        color: rgb(198, 0, 247);
        font-size: larger;
        text-shadow: 1px 1px 16px rgb(85, 0, 102);
        font-size: 30px;
    }
    #marchenoir {
        background-color: rgb(0, 0, 0);
        width: 1000px;
        height: 500px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    #cybershop {
        width: 1000px;
        height: 700px;
        z-index: 4;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    #span {
        text-shadow: 1px 1px 9px rgb(0, 0, 0);
        color: rgb(248, 0, 0);
        font-size: 22px;
        line-height: 10px;
        cursor: url("/img/mouse2.png"), pointer;
        position: absolute;
        right: 25px;
        top: 9px;
        width: 45px;
        height: 30px;
    }
    #span:hover {
        text-shadow: 1px 1px rgb(202, 0, 0);
    }
    #block {
        width: fit-content;
        height: fit-content;
        border-radius: 12px;
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        justify-self: center;
        flex-direction: column;
        z-index: 2;
        color: rgb(255, 255, 255);
        align-items: center;
        font-size: 13px;
        border: solid black 1px;
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000;
    }
    #logo {
        animation: clignotement 1s infinite alternate;
        cursor: url("/img/mouse2.png"), pointer;
    }
    img {
        /*  animation-iteration-count: 4; */
        z-index: 3;
    }
    p {
        font-size: 9px;
        z-index: 2;
    }
    #fond {
        position: absolute;
        position: absolute;
        z-index: -2;
        width: 1000px;
        height: 700px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border: solid 1px rgb(0, 167, 179);
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000;
        border-radius: 3px;
    }
    .menucache {
        display: none;
    }
    @media only screen and (min-width: 1920px) {
        /*  #block {
            margin-top: 0px;
            margin-right: 370px;
        } */
    }
</style>
