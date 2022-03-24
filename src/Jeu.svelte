<script>
    import { Allier, Personnage, Objet, chatouvert } from "./Class.js";
    //----------------------------------------------------------------------------------- Variables
    let windowwidth = window.screen.availWidth;
    let windowheight = window.screen.availHeight;
    //----------------------------------------------------------- Variable event
    let connecte;
    let joueur = new Personnage("invité", 0, 1);
    let toucheclavier;
    //---------------------------------------------------------------------------------------- Scene
    class Acceuil extends Phaser.Scene {
        constructor() {
            super("Acceuil");
        }
        //--------------------------------------------------------------------------------------- PRELOAD
        preload() {
            // JOUEUR
            // joueur.inventaire.push(objet);
            // joueur.inventaire.push(objet2);
            // PNJ
            /*  this.load.image("dude", "/img/boy.png", { frameWidth: 48, frameHeight: 48 });
            // PARTICULE
            this.load.image("particule", "/img/glitter2.png", {
                frameWidth: 21,
                frameHeight: 21
            }); */
            // MAP
            this.load.image("mapimg", "img/tokyo.png", {
                frameWidth: 1000,
                frameHeight: 500
            });
        }
        //------------------------------------------------------ CREATE
        create() {
            // CREATION MAP
            this.background = this.add
                .image(this.sys.canvas.width / 2, this.sys.canvas.height / 2, "mapimg")
                .setOrigin(0.5, 0.5);
            this.background.displayWidth = this.sys.canvas.width;
            this.background.displayHeight = this.sys.canvas.height;
            // CREATION JOUEUR
            // HITBOX
            // this.background.setPipeline("Light2D");
            this.lights.enable();
            // this.lights.setAmbientColor(55, 55, 255);
            var spotlight = this.lights.addLight(300, 300, 1600).setIntensity(3);
            var spotlight2 = this.lights.addLight(1400, 200, 800).setIntensity(3);
            var spotlight3 = this.lights.addLight(690, 200, 800).setIntensity(3);
            var spotlight4 = this.lights.addLight(950, 300, 800).setIntensity(2);
            // // CREATION PARTICULE
            this.input.on("pointermove", function (pointer) {});
            toucheclavier = this.input.keyboard.createCursorKeys();
            // -----------------------------CREATION ANIMATION
        }
        //-----------------------------------------------------------------------------------UPDATE
        update() {
            if (connecte === true) {
                /* console.log("jeu commencé"); */
                hudcache = false;
                joueur.sante += 0;
                // this.scene.start("SceneB", "SceneA");
            }
        }
    }
    const config = {
        width: windowwidth,
        height: windowheight,
        pixelArt: false,
        scene: [Acceuil],
        type: Phaser.AUTO,
        parent: "jeu",
        physics: {
            default: "arcade",
            arcade: {
                gravity: { y: 0 }
            }
        },
        scale: {
            parent: "jeu",
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        }
    };
    var game = new Phaser.Game(config);
</script>

<svelte:window
    on:keydown={(event) => {
        if (event.key === "p") {
            console.log("touche p !");
            console.log(joueur);
        }
        /* console.log(event); */
    }}
    on:mousemove={() => {}}
/>

<main />

<style>
</style>
