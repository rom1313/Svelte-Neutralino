<script>
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
    export let infonom,
        infoprix,
        infodescription,
        infotype,
        infocreateur,
        infoqualite,
        infomateriauxchimique,
        infomateriauxonix,
        infoimg,
        infoeffet;
    export let y;
    export let x;
    let test = 58;
</script>

<div style="top:{y - 110}px;left:{x + 45}px">
    <img src="img/infobulle.png" alt="" id="infobulle" />
    <p id="nom">
        {infonom}
    </p>
    <img src={infoimg} alt="infobulle" id="imgobjet" />

    <p>
        <span>Infos : </span>
        {infodescription}
    </p>
    <p>
        <span>Prix : </span>
        {infoprix}
    </p>
    <p>
        <span>Type : </span>
        {infotype}
    </p>
    <p>
        <span>Créateur : </span>
        {infocreateur}
    </p>
    {#if infoqualite === "Basique"}
        <p>
            <span>Qualité : </span>
            {infoqualite}
        </p>
    {/if}
    {#if infoqualite === "Rare"}
        <p id="rare">
            <span>Qualité : </span>
            {infoqualite}
        </p>
    {/if}
    {#if infoqualite === "Légendaire"}
        <p id="legendaire">
            <span>Qualité : </span>
            {infoqualite}
        </p>
    {/if}
    <p>
        <span>Effet : </span>
        {infoeffet}
    </p>
    <p>
        <span>Métal : </span>
        {infomateriauxonix}
    </p>

    <p>
        <span>Chimie : </span>{infomateriauxchimique}
    </p>
    <p>
        <span>Prix Cybershop : </span>
        {infoprix * 4}
    </p>
</div>

<style>
    @keyframes imginfobulle {
        from {
            transform: scale(1);
        }
        to {
            transform: scale(2);
        }
    }
    div {
        background-color: rgba(37, 37, 37, 0.935);
        width: 225px;
        height: 294px;
        position: fixed;
        border-radius: 15px;
        box-shadow: 0px 0px 10px rgb(0, 0, 0) inset;
        border: solid 1px rgb(0, 0, 0);
        box-shadow: 0px 0px 10px rgb(0, 0, 0);
        z-index: 6;
        color: rgb(255, 255, 255);
        text-shadow: 1px 1px 6px rgb(0, 0, 0);
    }
    #imgobjet {
        opacity: 1;
        position: relative;
        margin-top: 3px;
        margin-bottom: -9px;
        z-index: 6;
    }
    p {
        font-size: 11px;
        text-shadow: 1px 1px 6px rgb(0, 0, 0);
        z-index: 6;
    }
    #nom {
        font-size: 11px;
        color: rgb(255, 170, 0);
        margin-top: 6px;
        margin-bottom: 3px;
        z-index: 6;
    }
    span {
        color: rgb(255, 8, 197);
        background-color: rgb(0, 0, 0);
        border: solid 1px black;
        border-radius: 15px;
        text-shadow: 1px 1px 16px rgb(85, 0, 102);
        font-size: 10px;
        margin-left: 2px;
        margin-right: 3px;
        z-index: 6;
        padding: 2px;
        box-shadow: 0px 0px 3px rgb(0, 0, 0) inset;
    }
    #rare {
        color: red;
    }
    #legendaire {
        color: gold;
    }
    #infobulle {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: -1;
        border-radius: 15px;
        padding: 1px;
    }
</style>
