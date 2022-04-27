<script>
    import { socket, sauvegarde } from "./Variables.js";
    import { getContext, setContext } from "svelte";
    import { Allier, Personnage, Objet, chatouvert } from "./Class.js";
    import { focuschat } from "./Class.js";
    export let inventairejoueur;
    export let placeinventaire;
    export let menucacher;
    export let cyberz;
    $: placeinventaire = joueur.inventaire.length;
    $: inventairejoueur = joueur.inventaire;
    let joueur = getContext("joueur");
    let dopant = new Objet(
        "Stimulant",
        90,
        "img/potion.png",
        "consommable",
        "Un cocktail chimique stimulant",
        "+3 force"
    );
    let ildaa = [new Audio("son/effet/ildaaok.mp3"), new Audio("")];
    menucacher = true;
</script>

<svelte:window
    on:keydown={(event) => {
        if (event.key === "i" || event.key === "I") {
            if (!$focuschat === true && menucacher === true) {
                menucacher = false;
            } else if (!$focuschat === true && menucacher === false) {
                menucacher = true;
            }
        } else if (event.key === "Escape" && menucacher === false) {
            menucacher = true;
        }
    }}
    on:mousemoove={() => {}}
/>
{#if !menucacher}
    <div id="inventaire">
        <p id="nomfenetre">Inventaire (i)</p>
        <img src="img/inventaire.png" alt="" id="fondinventaire" />
        {#each inventairejoueur as cat, i}
            <div id="blockobjets">
                <img src={cat.img} alt="" id="imgobjets" />
                <p id="nomobjet">{cat.nom}</p>
                <div id="blockimgobjet">
                    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                    <img
                        src="img/vendre.png"
                        alt=""
                        id="vendre"
                        on:click={(event) => {
                            if (cat.nom === "Carte d'agent") {
                                return;
                            } else {
                                let data = {
                                    pseudo: joueur.pseudo,
                                    objet: cat
                                };
                                socket.emit("cybershop", data);
                                joueur.inventaire.splice(i, 1);
                                /*   enregistrementjoueur(
                                joueur.pseudo,
                                joueur.cyberz,
                                joueur.niveau,
                                joueur.sante,
                                joueur.attaque,
                                joueur.defense,
                                joueur.xp,
                                joueur.pass,
                                joueur.inventaire,
                                joueur.kill,
                                joueur.score,
                                joueur.puce,
                                joueur.amelioration,
                                joueur.relique
                            ); */
                                sauvegarde(joueur);
                                ildaa[0].play();
                                /* menucacher = true; */
                                placeinventaire = joueur.inventaire.length;
                                setTimeout(() => {
                                    menucacher = false;
                                }, 0);
                            }
                        }}
                        on:mouseover={(e) => {
                            e.target.src = "img/vendre2.png";
                        }}
                        on:mouseout={(e) => {
                            e.target.src = "img/vendre.png";
                        }}
                    />
                    <img id="retroconfection" alt="" src="img/infoobjet.png" />
                </div>
            </div>
        {/each}

        <div />
        <p id="placeinventaire">{placeinventaire} /35</p>
        <p id="cyberz">{cyberz}</p>
        <p id="nomcyberz">Crédits :</p>
        <span
            id="fermer"
            on:click={() => {
                menucacher = true;
            }}>X</span
        >
    </div>
{/if}
<img
    src="img/inventairelogo.png"
    alt=""
    id="bouttoninventaire"
    on:click={() => {
        if (menucacher) {
            menucacher = false;
        } else {
            menucacher = true;
        }
    }}
/>
>

<style>
    #cyberz {
        color: rgb(198, 0, 247);
        font-size: larger;
        text-shadow: 1px 1px 16px rgb(85, 0, 102);
        font-size: 25px;
        bottom: -27px;
        left: 110px;
        position: absolute;
    }
    #nomcyberz {
        bottom: -12px;
        position: absolute;
        left: 15px;
        color: white;
        text-shadow: 1px 1px 16px rgb(0, 0, 0);
    }
    #bouttoninventaire {
        position: absolute;
        top: 30px;
        cursor: url("/img/mouse2.png"), pointer;
        left: 10px;
    }
    #bouttoninventaire:hover {
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #6f0000;
    }
    #inventaire {
        position: absolute;
        border: solid 1px aqua;
        border-radius: 2%;
        display: grid;
        grid-template-rows: 80px 80px 80px 80px 80px 80px 80px;
        grid-template-columns: 91px 91px 91px 91px 91px;
        padding-left: 1px;
        padding-top: 30px;
        width: 455px;
        height: 600px;
        overflow: hidden;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background-color: #000000;
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000;
    }
    #blockobjets {
        width: 89px;
        height: 77px;
        background-color: rgb(60, 0, 0);
        border: solid 0.5px rgb(0, 0, 0);
        border-radius: 9%;
        box-shadow: 0px 0px 5px rgb(0, 0, 0), 0px 0px 5px #000000 inset;
    }
    #blockobjets:hover {
    }
    #blockobjets p {
        bottom: 0%;
        margin: 0%;
    }
    #blockimgobjet {
        width: 60px;
        margin: auto;
        top: 0%;
        display: flex;
        justify-content: space-between;
        margin-top: 2px;
        height: fit-content;
    }
    #retroconfection {
        cursor: url("/img/mouse2.png"), pointer;
    }
    #placeinventaire {
        position: absolute;
        right: 17px;
        bottom: -12px;
        color: aqua;
        text-shadow: 1px 1px 16px rgb(0, 0, 0);
    }
    #nomobjet {
        font-size: 7px;
        color: aqua;
    }
    #vendre {
        cursor: url("/img/mouse2.png"), pointer;
    }
    #vendre:hover {
        transform: scale(1.1);
    }
    #fondinventaire {
        position: absolute;
        border-radius: 10px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: -1;
        user-select: none;
    }
    #fermer {
        color: rgb(64, 64, 64);
        cursor: url("/img/mouse2.png"), pointer;
        margin-left: 20px;
        width: 20px;
        background-color: rgb(0, 0, 0);
        position: fixed;
        border-radius: 5px;
        right: 5px;
        top: 5px;
        right: 10px;
    }
    #fermer:hover {
        box-shadow: 0px 0px 6px rgb(255, 0, 0), 0px 0px 10px #000000;
        cursor: url("/img/mouse2.png"), pointer;
        color: red;
    }
    #imgobjets {
        background-color: #222222;
        border-radius: 20px;
        box-shadow: 0px 0px 5px rgb(0, 0, 0), 0px 0px 5px #000000 inset;
        border: solid 1px black;
        margin-top: 4px;
    }
    #imgobjets:hover {
        box-shadow: 0px 0px 5px rgb(255, 187, 0), 0px 0px 10px #000000 inset;
    }
    #nomfenetre {
        color: yellow;
        position: absolute;
        top: -5px;
        left: 10px;
        font-size: 12px;
    }
</style>
