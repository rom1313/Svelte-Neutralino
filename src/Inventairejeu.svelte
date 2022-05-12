<script>
    import Infobulleinventaire from "./Infobulleinventaire.svelte";
    import { socket, sauvegarde } from "./Variables.js";
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
        effetarme
    } from "./Class.js";
    let infobulleouvert;
    export let inventairejoueur;
    export let placeinventaire;
    export let menucacher;
    export let cyberz;
    let infonom,
        infoimg,
        infoprix,
        infoeffet,
        infodescription,
        infotype,
        infocreateur,
        infoqualite,
        infomateriauxchimique,
        infomateriauxonix;
    let pointerx, pointery;
    export let materiauxchimique, materiauxonix;
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

    menucacher = true;
</script>

<svelte:window
    on:keydown={(event) => {
        if (event.key === "i" || event.key === "I") {
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
{#if !menucacher}
    <div id="inventaire">
        <p id="nomfenetre">Inventaire (i)</p>
        <p id="metal"><img src="img/metal.png" alt="" /> {materiauxonix}</p>
        <p id="chimi"><img src="img/chimi.png" alt="" /> {materiauxchimique}</p>
        <img src="img/inventaire.png" alt="" id="fondinventaire" />
        {#each inventairejoueur as cat, i}
            <div id="blockobjets">
                <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                <img
                    src={cat.img}
                    alt=""
                    id="imgobjets"
                    on:mouseover={(event) => {
                        infobulleouvert = true;

                        infonom = cat.nom;
                        infoimg = cat.img;
                        infoprix = cat.prix;
                        infodescription = cat.description;
                        infotype = cat.type;
                        infocreateur = cat.createur;
                        infoqualite = cat.qualite;
                        infomateriauxchimique = cat.materiauxchimique;
                        infomateriauxonix = cat.materiauxonix;
                        infoeffet = cat.effet;

                        pointerx = event.x;
                        pointery = event.y;
                        effetui.hover.volume = 0.1;
                        effetui.hover.play();
                    }}
                    on:mouseout={(event) => {
                        infobulleouvert = false;
                    }}
                />
                <p id="nomobjet">{cat.nom}</p>
                <div id="blockimgobjet">
                    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                    <img
                        src="img/vendre.png"
                        alt=""
                        id="vendre"
                        on:click={(event) => {
                            if (cat.type === "Personnel") {
                                effetui.error.volume = 0.1;
                                effetui.error.play();
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
                                effetui.vendre.volume = 0.1;
                                effetui.vendre.play();
                                /* menucacher = true; */
                                placeinventaire = joueur.inventaire.length;
                            }
                        }}
                        on:mouseover={(e) => {
                            effetui.hover.volume = 0.1;
                            effetui.hover.play();
                            e.target.src = "img/vendre2.png";
                        }}
                        on:mouseout={(e) => {
                            e.target.src = "img/vendre.png";
                        }}
                    />
                    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                    <img
                        id="retroconfection"
                        alt=""
                        src="img/recycler.png"
                        on:click={(event) => {
                            if (cat.materiauxchimique === 0 && cat.materiauxonix === 0) {
                                effetui.error.volume = 0.1;
                                effetui.error.play();
                                return;
                            } else {
                                joueur.materiauxchimique += cat.materiauxchimique;
                                joueur.materiauxonix += cat.materiauxonix;
                                joueur.inventaire.splice(i, 1);

                                sauvegarde(joueur);
                                effetui.retroconfection.volume = 0.1;
                                effetui.retroconfection.play();

                                /* menucacher = true; */
                                placeinventaire = joueur.inventaire.length;
                            }
                        }}
                        on:mouseover={(e) => {
                            effetui.hover.volume = 0.1;
                            effetui.hover.play();

                            e.target.src = "img/recycler2.png";
                        }}
                        on:mouseout={(e) => {
                            e.target.src = "img/recycler.png";
                        }}
                    />
                </div>
            </div>
        {/each}

        <div />
        <p id="placeinventaire">{placeinventaire} /35</p>
        <p id="cyberz">{cyberz}</p>
        <p id="nomcyberz">Crédits :</p>
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
    </div>
    {#if infobulleouvert}
        <Infobulleinventaire
            {infonom}
            {infoprix}
            {infodescription}
            {infotype}
            {infocreateur}
            {infoqualite}
            {infomateriauxonix}
            {infomateriauxchimique}
            {infoimg}
            {infoeffet}
            x={pointerx}
            y={pointery}
        />
    {/if}
{/if}
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<img
    src="img/inventairelogo.png"
    alt=""
    id="bouttoninventaire"
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
>

<style>
    #cyberz {
        color: rgb(198, 0, 247);
        font-size: 15px;
        text-shadow: 1px 1px 16px rgb(85, 0, 102);
        font-size: 24px;
        bottom: -26px;
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
        left: 15px;
    }
    #bouttoninventaire:hover {
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #6f0000;
    }
    #inventaire {
        position: absolute;
        border: solid 0.5px aqua;
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
        color: rgb(255, 170, 0);
        text-shadow: 1px 1px 6px rgb(0, 0, 0);
        position: absolute;
        top: -4px;
        left: 10px;
        font-size: 11px;
    }
    #metal {
        color: #b2b2b2;
        position: absolute;
        bottom: 0px;
        left: 250px;
        font-size: 10px;
        text-shadow: 1px 1px 6px rgb(0, 0, 0);
    }
    #chimi {
        color: #33ca00;
        position: absolute;
        bottom: 0px;
        left: 300px;
        font-size: 10px;
        text-shadow: 1px 1px 6px rgb(0, 0, 0);
    }
</style>
