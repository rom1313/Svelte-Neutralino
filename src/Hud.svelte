<script>
    import Inventairejeu from "./Inventairejeu.svelte";
    import { socket, sauvegarde } from "./Variables.js";
    import { getContext, setContext } from "svelte";

    import { onMount } from "svelte";
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
    export let pseudo;
    export let cyberz;
    export let niv;
    export let barredevie;
    export let sante;
    export let xp;
    export let kill;
    export let score;
    export let inventaire;
    export let menucacher;
    export let placeinventaire;

    onMount(async () => {});

    $: placeinventaire = joueur.inventaire.length;

    kill.forEach((element) => {});
    let joueur = getContext("joueur");

    $: objets = inventaire;
    menucacher = true;
</script>

<svelte:window
    on:keydown={(event) => {
        if (event.key === "p" || event.key === "P") {
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
    <div id="block" class={menucacher ? "menucache" : ""}>
        <img id="fond" src="img/profil.png" alt="" />
        <div id="portrait">
            <img src={joueur.img} alt="" />
        </div>
        <div id="blockstage">
            <div>
                <h1>Stage 1</h1>
                <p>Kills : {kill[0]} || Score : {score[0]}</p>
            </div>
            <div>
                <h1>Stage 2</h1>
                <p>Kills : {kill[1]} || Score : {score[1]}</p>
            </div>
            <div>
                <h1>Stage 3</h1>
                <p>Kills : {kill[2]} || Score : {score[2]}</p>
            </div>
            <div>
                <h1>Stage 4</h1>
                <p>Kills : {kill[3]} || Score : {score[3]}</p>
            </div>
        </div>
        <div id="inventaire">
            {#each objets as cat, i}
                <div id="blockobjets">
                    <img src={cat.img} alt="" />
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
        </div>
        <p id="placeinventaire">{placeinventaire} /36</p>
        <p id="pseudo">{pseudo}</p>
        <p id="grade">Grade : {niv}</p>

        <!--  <p>Santé :</p>
        <p>{sante}</p>
        <div id="containersante">
            <div id="vie" style="width:{barredevie * 4}px" />
        </div>
        <span id="sante" />
        <p>Exp : {xp}</p> -->
        <p id="cyberz">Crédits: <span>{cyberz}</span></p>
        <p
            id="croixfermer"
            on:click={(event) => {
                menucacher = true;
            }}
        >
            X
        </p>
    </div>
{/if}
<button
    id="fermer"
    on:click={(e) => {
        if (menucacher === true) {
            effets[1].volume = 0.05;

            effets[1].play();
            menucacher = false;
        } else {
            menucacher = true;
        }
    }}
>
    Carrière
</button>

<!-- <button
    on:click={(e) => {
        joueur.inventaire.push(dopant);
        joueur.cyberz += 10;
    }}>test</button
> -->
<style>
    @keyframes apparitionprofil {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    #nomobjet {
        font-size: 7px;
    }
    #vendre {
        cursor: url("/img/mouse2.png"), pointer;
    }
    #vendre:hover {
        transform: scale(1.1);
    }
    #blockimgobjet {
        width: 60px;
        margin: auto;
        top: 0%;
        display: flex;
        justify-content: space-between;
        margin-top: 5px;
        height: fit-content;
    }
    #retroconfection {
        cursor: url("/img/mouse2.png"), pointer;
    }
    #placeinventaire {
        position: absolute;
        right: 20px;
        bottom: 268px;
    }
    #containersante {
        margin: auto;
        border: solid 1px rgb(0, 167, 179);
        background-color: rgba(0, 0, 0, 0.253);
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000;
        display: flex;
        justify-content: center;
        width: fit-content;
    }
    #portrait {
        border: solid 1px rgb(0, 167, 179);
        width: 120px;
        position: absolute;
        top: 80px;
        left: 20px;
        border-radius: 5px;
    }
    #grade {
        position: absolute;
        top: 250px;
        left: 50px;
    }
    #pseudo {
        position: absolute;
        font-size: 22px;
        top: 200px;
        left: 40px;
    }
    #cyberz {
        position: absolute;
        bottom: 74px;
        left: 580px;
        font-size: 22px;
    }
    #vie {
        height: 13px;
        width: 34px;
        background-color: rgb(231, 158, 0);
    }
    #block {
        text-align: center;
        align-items: center;
        border: solid 1px rgb(0, 167, 179);
        align-self: center;
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000;
        position: absolute;
        border-radius: 3px;
        background-color: rgba(0, 0, 0, 0.616);
        width: 1000px;
        height: 700px;
        z-index: 4;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    #blockobjets {
        width: 89px;
        height: 80px;
        background-color: rgb(39, 39, 39);
        border: solid 0.5px rgb(0, 0, 0);
        border-radius: 9%;
        box-shadow: 0px 0px 5px rgb(0, 0, 0), 0px 0px 5px #000000 inset;
    }
    #blockobjets p {
        bottom: 0%;
        margin: 0%;
        
    }
    #inventaire {
        position: absolute;
        border: solid 1px rgb(179, 0, 0);
        border-radius: 2%;
        display: grid;
        grid-template-rows: 80px 80px 80px 80px 80px;
        grid-template-columns: 91px 91px 91px 91px 91px 91px 91px 91px 91px;
        padding-left: 1px;
        padding-top: 3px;
        width: 821px;
        height: 350px;
        overflow: hidden;
        left: 169px;
        top: 80px;
    }
    #blockstage {
        display: flex;
        flex-direction: row;
        width: fit-content;
        position: absolute;
        bottom: 150px;
        column-gap: 60px;
        left: 20px;
        border: solid 1px rgb(163, 163, 163);
        padding: 15px;
    }
    #blockstage p {
        font-size: 12px;
    }
    h1 {
        color: rgb(243, 243, 243);
        font-size: 15px;
        margin: 0;
    }
    #sante {
        color: rgb(0, 255, 0);
        font-size: medium;
        margin-top: 18px;
    }
    P {
        text-shadow: 1px 1px 9px rgb(0, 0, 0);
        color: rgb(0, 248, 236);
        font-size: 10px;
        line-height: 10px;
    }
    span {
        color: rgb(198, 0, 247);
        font-size: larger;
        text-shadow: 1px 1px 16px rgb(85, 0, 102);
        font-size: 30px;
    }
    #fermer {
        z-index: 1;
        transform: translate(-50%, -50%);
        position: fixed;
        top: 355px;
        left: 50%;
        display: initial;
        cursor: url("/img/mouse2.png"), pointer;
        color: rgb(92, 255, 247);
        border-radius: 12px;
        font-size: 35px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.193), 0px 0px 10px #000000;
        font-weight: 1900px;
        background-color: #000000;
        font-family: "scifi";
    }
    #fermer:hover {
        color: #ffcc00;
    }
    .menucache {
        display: none;
    }
    #fond {
        position: absolute;
        z-index: -2;
        width: 1000px;
        height: 700px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    #croixfermer {
        color: red;
        position: fixed;
        right: 15px;
        top: -7px;
        font-size: 15px;

        cursor: url("/img/mouse2.png"), pointer;

        width: 30px;

        border-radius: 5px;
    }
    #croixfermer:hover {
        text-shadow: 1px 1px 16px rgb(0, 0, 0);
        color: #ffcc00;
    }

    @media only screen and (min-width: 1920px) {
    }
</style>
