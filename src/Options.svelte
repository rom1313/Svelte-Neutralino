<script>
    //--------------------------------------------------------------------imports
    import { socket } from "./Variables.js";
    import { getContext, setContext, onMount } from "svelte";
    import { volume } from "./Class.js";
    //-------------------------------------------------------------------------------- variables
    export let optioncacher = true;

    //------------------------------------------------------------------------------------

    onMount(async () => {});
</script>

<svelte:window
    on:keydown={(event) => {
        if (event.key === "Escape") {
            console.log("echap appuyé");

            if (optioncacher === false) {
                optioncacher = true;
            }
        }
    }}
    on:mousemoove={() => {}}
/>
<img
    id="optionlogo"
    src="img/option.png"
    alt=""
    on:click={() => {
        if (optioncacher === true) {
            optioncacher = false;
        } else {
            optioncacher = true;
        }
    }}
/>
<div id="blockoption" class={optioncacher ? "menucache" : ""}>
    <span
        id="fermer"
        on:click={() => {
            optioncacher = true;
        }}>X</span
    >
    <p>Musique :</p>
    <div id="blockvolume">
        <button
            on:click={() => {
                if ($volume > 0) {
                    $volume -= 0.25;
                } else {
                }
            }}>-</button
        >

        <button
            on:click={() => {
                if ($volume < 1) {
                    $volume += 0.25;
                } else {
                }
            }}>+</button
        >
        <p id="volume">{$volume}</p>
    </div>

    <div id="volumebarre" style="width:{$volume * 80}px" />
    <p>Aide</p>
    <p>Contact</p>
</div>

<style>
    @font-face {
        font-family: "scifi";
        src: url("/conthrax-sb.ttf");
    }

    .menucache {
        display: none;
        cursor: initial;
        z-index: 0;
        margin-right: 333px;
    }
    #optionlogo {
        position: fixed;
        bottom: 75px;
        left: 32px;
    }
    #optionlogo:hover {
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000;
        cursor: url("/img/mouse2.png"), pointer;

        border-radius: 45%;
    }
    #blockoption {
        background-color: rgba(34, 34, 34, 0.696);
        width: 200px;
        height: 150px;
        position: fixed;
        bottom: 60px;
        left: 100px;
        box-shadow: 0px 0px 3px rgb(0, 0, 0), 0px 0px 10px #000000;
        margin: auto;
        border-radius: 15px;

        border: solid 1px rgb(0, 167, 179);
    }
    #volumebarre {
        height: 23px;
        background-color: rgb(25, 0, 255);
        position: absolute;
        top: 35px;
        left: 70px;
        box-shadow: 0px 0px 3px rgb(0, 0, 0), 0px 0px 10px #000000;
        border-radius: 5px;
    }
    #volume {
        position: absolute;
        top: 30px;
        right: 10px;
        pointer-events: none;
        font-size: 15px;
        color: rgb(255, 234, 0) (108, 30, 30);
    }
    #blockvolume {
        display: flex;
        align-items: flex-start;
    }
    button {
        border-radius: 5px;
        color: rgb(0, 167, 179);
        background-color: #000000;
        border: none;

        margin-left: 8px;
        font-size: 20px;
        cursor: url("/img/mouse2.png"), pointer;
    }
    p {
        margin-top: 6px;
        margin-bottom: 10px;
        color: white;
    }
    #fermer {
        color: rgb(64, 64, 64);
        cursor: url("/img/mouse2.png"), pointer;
        margin-left: 20px;
        width: 20px;
        background-color: rgb(0, 0, 0);
        position: absolute;
        border-radius: 5px;
        top: 6px;
        right: 8px;
    }
    #fermer:hover {
        box-shadow: 0px 0px 6px rgb(255, 0, 0), 0px 0px 10px #000000;
        cursor: url("/img/mouse2.png"), pointer;
        color: red;
    }
</style>
