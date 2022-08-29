<script>
    import { element } from "svelte/internal";
    import Cybershop from "./Cybershop.svelte";
    import { getContext, setContext } from "svelte";
    import { fade, fly } from "svelte/transition";
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
        contenuchat,
        joueur
    } from "./Class.js";
    let notifnom;
    let notifobjet;
    let notifprix;
    let notifargentactuel;
    let notifcacher = true;
    let timer;
    let detailobjetouvert = false;
    let cybershopouvert = false;

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
    socket.on("ventecybershop", (data) => {
        if (data.pseudovendeur === $joueur.pseudo) {
            console.log(data.pseudoacheteur, data.prixproduit, data.produit, data.argent);
            notifnom = data.pseudoacheteur;
            notifobjet = data.produit;
            notifprix = data.prixproduit;
            notifargentactuel = data.argent;
            notifcacher = false;
            timer = setTimeout(() => {
                if (notifcacher != true) {
                    notifcacher = true;
                }
            }, 12000);
        }
    });
</script>

{#if !notifcacher}
    <div id="notif" out:fly>
        <span
            id="fermernotif"
            on:click={() => {
                notifcacher = true;
                clearTimeout(timer);
            }}>x</span
        >
        <h1 id="titrenotif">Nouvelle Vente !</h1>
        <p>
            <span class="notifnom">{notifnom}</span> a acheté :
            <span class="notifnom">{notifobjet}</span>
            pour la somme de :
            <span class="notifnom"
                >{notifprix}
                crédits</span
            >
        </p>
        <p>Votre solde est désormais de : <span class="notifnom">{notifargentactuel}</span></p>
    </div>
{/if}

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
                                    nomproduit: objet.objet.nom,
                                    pseudoacheteur: $joueur.pseudo
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

                                $joueur.inventaire.push(objetacheter);
                                socket.emit("cocybershop");
                            }}>Acheter</button
                        >
                    </div>
                {/each}
            </div>
        </div>
        <p id="cyberz"><span id="credits">Crédits :</span> {$joueur.cyberz}</p>
        <p id="nbobjets">Objets en ventes : {cybershop.length}</p>
    </div>
{/if}

<style>
    @keyframes briller {
        from {
            opacity: 50%;
        }
        to {
            opacity: 100%;
        }
    }
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
            color: rgb(52, 0, 58);
        }
        to {
            color: rgb(255, 0, 238);
        }
    }
 
    #credits {
        color: white;
    }
    #prixobjet {
        color: rgb(204, 0, 255);
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
    
    #acheter {
        cursor: url("/img/mouse2.png"), pointer;
        background-color: black;
        color: rgb(198, 198, 198);
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
        bottom: 18px;
        font-size: 15px;
        color: chartreuse;
        left: 15px;
    }
    #cybershoptitre {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        width : 20%
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
        margin-top: 9px;
        z-index: 5;
        cursor: url("/img/mouse2.png"), pointer;
        background-color: black;
        color: rgb(255, 255, 255);
        font-size: 12px;
        padding: 5px;
        border-radius: 45px;
        box-shadow: 0px 0px 7px rgb(0, 247, 255), 0px 0px 10px #000000;
    }
    #listemarchenoir {
        z-index: 5;
        cursor: url("/img/mouse2.png"), pointer;
        position: absolute;
        top: 17px;
        color: rgb(95, 95, 95);
        left: 9px;
        font-size: 16px;
    }
    #listemarchenoir:hover {
      color: darkorange;
    }

    #cyberz {
        position: absolute;
        bottom: 10px;
        left: 790px;
        color: rgb(198, 0, 247);
        font-size: 25px;
        text-shadow: 1px 1px 16px rgb(85, 0, 102);
        font-size: 20px;
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
        background-color: rgb(0, 0, 0);
        text-shadow: 1px 1px 9px rgb(0, 0, 0);
        color: rgb(64, 64, 64);

        cursor: url("/img/mouse2.png"), pointer;
        position: fixed;
        right: 25px;
        top: 5px;
        width: 20px;

        border-radius: 5px;
    }
    #span:hover {
        box-shadow: 0px 0px 6px rgb(255, 0, 0), 0px 0px 10px #000000;
        cursor: url("/img/mouse2.png"), pointer;
        color: red;
    }
    #block {
        width: fit-content;
        height: fit-content;
        border-radius: 12px;
        position: absolute;
        top: 15%;
        left: 80%;
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
        border: solid 1px rgb(0, 0, 0);
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000;
        border-radius: 3px;
    }
    .menucache {
        display: none;
    }
    #notif {
        position: absolute;
        bottom: 35px;
        left: 12px;
        color: white;
        font-size: 35px;
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: flex-start;
        background-color: rgba(0, 0, 0, 0.49);
        border-radius: 20px;
        padding: 10px;
        animation: briller 1s infinite alternate;
        z-index: 10;
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000;
    }
    #notif p {
        font-size: 13px;
        margin: 5px;
        text-shadow: 1px 1px 16px rgb(0, 0, 0);
        font-weight: 1200;
    }
    .notifnom {
        color: rgb(198, 0, 247);

        text-shadow: 1px 1px 16px rgb(85, 0, 102);

        border-radius: 15px;
        padding: 4px;
    }
    #fermernotif {
        position: absolute;
        left: 505px;
        bottom: 85px;
        font-size: 15px;
        z-index: 11;
        color: white;
        text-shadow: 1px 1px 16px rgb(0, 0, 0);
    }
    #fermernotif:hover {
        color: red;
        cursor: url("/img/mouse2.png"), pointer;
    }
    #titrenotif {
        margin-top: 2px;
        margin-left: 5px;
        margin-bottom: 15px;
        font-size: 16px;
    }
    @media only screen and (min-width: 1920px) {
        /*  #block {
            margin-top: 0px;
            margin-right: 370px;
        } */
    }
</style>
