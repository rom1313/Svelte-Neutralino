<script>
    import { socket, sauvegarde } from "./Variables.js";
    import { getContext, setContext } from "svelte";
    import { Allier, Personnage, Objet, chatouvert } from "./Class.js";
    export let inventairejoueur;
    export let placeinventaire;
    export let menucacher;
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

{#if !menucacher}
    <div id="inventaire">
        {#each inventairejoueur as cat, i}
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
        <p id="placeinventaire">{placeinventaire} /35</p>
        <p id="cyberz">{joueur.cyberz}</p>
    </div>
{/if}
<button
    id="bouttoninventaire"
    on:click={() => {
        if (menucacher) {
            menucacher = false;
        } else {
            menucacher = true;
        }
    }}>Inventaire</button
>

<style>
    #cyberz {
        color: rgb(198, 0, 247);
        font-size: larger;
        text-shadow: 1px 1px 16px rgb(85, 0, 102);
        font-size: 30px;
        bottom: -20px;
        left: 17px;
        position: absolute;
    }
    #bouttoninventaire {
        position: absolute;
        top: 2px;
    }
    #inventaire {
        position: absolute;
        border: solid 1px rgb(179, 0, 0);
        border-radius: 2%;
        display: grid;
        grid-template-rows: 80px 80px 80px 80px 80px 80px 80px;
        grid-template-columns: 91px 91px 91px 91px 91px;
        padding-left: 1px;
        padding-top: 3px;
        width: 455px;
        height: 590px;
        overflow: hidden;
        left: 169px;
        top: 80px;
        background-color: #000000;
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
        right: 17px;
        bottom: -12px;
        color: aqua;
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
</style>
