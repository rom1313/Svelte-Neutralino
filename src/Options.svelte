<script>
    //--------------------------------------------------------------------imports
    import { socket } from "./Variables.js";
    import { getContext, setContext, onMount } from "svelte";
    //-------------------------------------------------------------------------------- variables
    export let optioncacher = true;
    export let volume = 1;
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
    <div id="blockvolume">
        <p>Volume :</p>
        <button
            on:click={() => {
                if (volume > 0) {
                    volume -= 0.25;
                } else {
                }
            }}>-</button
        >

        <button
            on:click={() => {
                if (volume < 2) {
                    volume += 0.25;
                } else {
                }
            }}>+</button
        >
    </div>
    :
    <p id="volume">{volume}</p>
    <div id="volumebarre" style="width:{volume * 20}px" />
    <p>Difficulté</p>
    :

    <p>option 1</p>
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
        bottom: 45px;
        left: 30px;
    }
    #optionlogo:hover {
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000;
        cursor: url("/img/mouse2.png"), pointer;
        background-color: rgb(0, 243, 178);
        border-radius: 45%;
    }
    #blockoption {
        background-color: rgb(34, 34, 34);
        width: 200px;
        height: 150px;
        position: fixed;
        bottom: 60px;
        left: 100px;

        margin: auto;
        border-radius: 15px;
    }
    #volumebarre {
        height: 13px;
        background-color: rgb(25, 0, 255);
        position: absolute;
        top: 35px;
        left: 40%;
    }
    #volume {
        position: absolute;
        top: 18px;
        right: 20px;
        pointer-events: none;
    }
    #blockvolume {
        background-color: chartreuse;
    }
    button {
        border-radius: 5px;
        color: rgb(251, 255, 0);
        background-color: #000000;
        border: none;
    }
</style>
