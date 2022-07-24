<script>
    import Infobulleinventaire from "./Infobulleinventaire.svelte";
    import { socket, sauvegarde } from "./Variables.js";
    import { getContext, setContext } from "svelte";
    import { fade, fly } from "svelte/transition";

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
    let infobulleouvert;
    export let inventairejoueur;
    export let menucacher;

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

    $: inventairejoueur = $joueur.inventaire;
    $: santejoueur = $joueur.sante;
    $: atkjoueur = $joueur.attaque;
    $: defjoueur = $joueur.defense;
    $: agljoueur = $joueur.vitesse;
    $: karmajoueur = $joueur.alignement;
    $: gradejoueur = $joueur.niveau;

    menucacher = true;
</script>

<svelte:window
    on:keydown={(event) => {
        if (event.key === "e" || event.key === "E") {
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
    <div id="inventaire" out:fly>
        <div id='puce1'></div>
        <div id='puce2'></div>
        <div id='puce3'></div>
        <div id='amelio1'></div>
        <div id='amelio2'></div>
        <div id='amelio3'></div>
        <p id="nomfenetre">Equipement (e)</p>
        <p id="grade">Grade : <span id="spangrade"> {gradejoueur}</span></p>
        <p id="karma">
            Karma : {#if karmajoueur === 0}
                <span id="spanneutre"> Neutre</span>
            {:else if karmajoueur > 0}
                <span id="spanbon"> Bon</span>
            {:else}
                <span id="spanmauvais"> Mauvais</span>
            {/if}
        </p>
        <p id="sante">Santé : <span id="spansante"> {santejoueur}</span></p>
        <p id="atk">Puissance : <span id="spanatk"> {atkjoueur}</span></p>
        <p id="def">Résistance : <span id="spandef"> {defjoueur}</span></p>
        <p id="agl">Agilité : <span id="spanagl"> {agljoueur}</span></p>

        <img src="img/equipement.png" alt="" id="fondinventaire" />
        {#each inventairejoueur as cat, i}
            <!-- svelte-ignore a11y-mouse-events-have-key-events -->
        {/each}

        <div />

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
    src="img/equipementlogo.png"
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
    @keyframes slide {
        from {
            opacity: 0;

            transform: translate(-50%, -50%) scale(0.1);
        }
        to {
            opacity: 1;
            transform: scale(1);
            transform: translate(-50%, -50%) scale(1);
        }
    }
    #puce1,#puce2,#puce3{
        width: 40px;
        background-color: blue;
        height: 40px;
        z-index: 2;
        position: absolute;
        border:solid 1px black
        
    }
    #puce1{
        top:160px;
        left: 48px;
    }

    #bouttoninventaire {
        position: absolute;
        top: 30px;
        cursor: url("/img/mouse2.png"), pointer;
        left: 85px;
    }
    #bouttoninventaire:hover {
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #6f0000;
    }
    #inventaire {
        position: absolute;
        border: solid 0 rgb(0, 0, 0);
        border-radius: 2%;

        padding-left: 1px;
        padding-top: 30px;
        width: 455px;
        height: 600px;
        overflow: hidden;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background-color: #000000;
        box-shadow: 0px 0px 10px rgb(0, 0, 0);
        animation: slide 0.1s linear alternate forwards;
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

    #nomfenetre {
        color: rgb(255, 170, 0);
        text-shadow: 1px 1px 6px rgb(0, 0, 0);
        position: absolute;
        top: -4px;
        left: 10px;
        font-size: 11px;
    }
    #grade {
        position: absolute;
        top: 34px;
        left: 24px;
    }
    #karma {
        position: absolute;
        top: 64px;
        left: 24px;
    }
    #sante {
        position: absolute;
        top: 34px;
        left: 300px;
    }
    #atk {
        position: absolute;
        top: 64px;
        left: 300px;
    }
    #def {
        position: absolute;
        top: 94px;
        left: 300px;
    }
    #agl {
        position: absolute;
        top: 124px;
        left: 300px;
    }
    #spangrade {
        color: white;
    }
    #spansante {
        color: green;
    }
    #spanatk {
        color: orange;
    }
    #spandef {
        color: blue;
    }
    #spanagl {
        color: purple;
    }
    #spanneutre {
        color: gray;
    }
    #spanbon {
        color: aqua;
    }
    #spanmauvais {
        color: red;
    }
    p {
        color: rgb(255, 255, 255);
        text-shadow: 1px 1px 16px rgb(133 0 163);
    }
</style>
