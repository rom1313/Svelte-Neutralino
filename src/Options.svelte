<script>
    //--------------------------------------------------------------------imports
    import { socket } from "./Variables.js";
    import { getContext, setContext, onMount } from "svelte";
    import {
        Allier,
        Personnage,
        Objet,
        chatouvert,
        Etats,
        focuschat,
        volume,
        pause,
        effetui
    } from "./Class.js";
    import Contact from "./Contact.svelte";
    //-------------------------------------------------------------------------------- variables
    export let optioncacher = true;

    //------------------------------------------------------------------------------------

    onMount(async () => {});
</script>

<svelte:window
    on:keydown={(event) => {
        if (event.key === "Escape") {
            if (optioncacher === false) {
                effetui.fermer.volume = 0.1;
                effetui.fermer.play();
                optioncacher = true;
            }
        }
    }}
    on:mousemoove={() => {}}
/>
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<img
    id="optionlogo"
    src="img/option.png"
    alt=""
    on:click={() => {
        if (optioncacher === true) {
            effetui.selection.volume = 0.1;
            effetui.selection.play();
            optioncacher = false;
        } else {
            effetui.fermer.volume = 0.1;
            effetui.fermer.play();
            optioncacher = true;
        }
    }}
    on:mouseover={() => {
        effetui.hover.volume = 0.1;
        effetui.hover.play();
    }}
/>
<div id="blockoption" class={optioncacher ? "menucache" : ""}>
    <img id="fondoption" src="img/fondoption.png" alt="" />
    <Contact />
    <p>Aide</p>
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <span
        id="fermer"
        on:click={() => {
            effetui.fermer.volume = 0.1;
            effetui.fermer.play();
            optioncacher = true;
        }}
        on:mouseover={() => {
            effetui.hover.volume = 0.1;
            effetui.hover.play();
        }}>X</span
    >

    <div id="blockvolume">
        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
        <button
            id="bouttonmoins"
            on:click={() => {
                effetui.selection.volume = 0.1;
                effetui.selection.play();
                if ($volume > 0) {
                    $volume -= 0.25;
                } else {
                }
            }}
            on:mouseover={() => {
                effetui.hover.volume = 0.1;
                effetui.hover.play();
            }}>-</button
        >

        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
        <button
            id="bouttonplus"
            on:click={() => {
                effetui.selection.volume = 0.1;
                effetui.selection.play();
                if ($volume < 1) {
                    $volume += 0.25;
                } else {
                }
            }}
            on:mouseover={() => {
                effetui.hover.volume = 0.1;
                effetui.hover.play();
            }}>+</button
        >
        <p id="vol">Vol. musique :</p>
        <p id="volume">{$volume}</p>
    </div>

    <div id="volumebarre" style="width:{$volume * 120}px" />
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
        left: 22px;
    }
    #optionlogo:hover {
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000;
        cursor: url("/img/mouse2.png"), pointer;

        border-radius: 45%;
    }
    #blockoption {
        background-color: rgb(34, 34, 34);
        width: 250px;
        height: 155px;
        position: fixed;
        bottom: 50px;
        left: 100px;
        box-shadow: 0px 0px 3px rgb(0, 0, 0), 0px 0px 10px #000000;
        margin: auto;
        border-radius: 15px;

        border: solid 1px rgb(0, 0, 0);
    }
    #volumebarre {
        height: 10px;
        background-color: rgb(25, 0, 255);
        position: absolute;
        bottom: 18px;
        left: 70px;
        box-shadow: 0px 0px 3px rgb(0, 0, 0), 0px 0px 10px #000000;
        border-radius: 5px;
        border: solid 1px black;
    }
    #volume {
        position: absolute;
        bottom: 5px;
        right: 18px;
        pointer-events: none;
        font-size: 18px;
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

        margin-left: 6px;
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
        top: 12px;
        right: 8px;
    }
    #fermer:hover {
        box-shadow: 0px 0px 6px rgb(255, 0, 0), 0px 0px 10px #000000;
        cursor: url("/img/mouse2.png"), pointer;
        color: red;
    }
    #bouttonmoins {
        top: 75%;
        position: absolute;
        left: 5px;
    }
    #bouttonmoins:hover {
        color: rgb(255, 191, 0);
    }
    #bouttonplus {
        position: absolute;
        top: 75%;
        left: 30px;
    }
    #bouttonplus:hover {
        color: rgb(255, 191, 0);
    }
    #vol {
        left: 55px;
        position: absolute;
    }
    #fondoption {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: -2;
        border-radius: 15px;
    }
</style>
