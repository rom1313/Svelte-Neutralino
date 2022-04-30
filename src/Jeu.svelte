<script>
    import { Allier, Personnage, Objet, chatouvert, Etats } from "./Class.js";
    import { socket, sauvegarde } from "./Variables.js";
    import Chat from "./Chat.svelte";
    import Hud from "./Hud.svelte";
    import Inventairejeu from "./Inventairejeu.svelte";
    import Options from "./Options.svelte";
    import Contact from "./Contact.svelte";
    import { getContext, setContext } from "svelte";
    import { focuschat, volume } from "./Class.js";

    //----------------------------------------------------------------------------------- Variables

    /* async function demarrage() {
        await Neutralino.window.move(0, 0);
    }
    demarrage(); */
    let windowwidth = window.screen.availWidth;
    let windowheight = window.screen.availHeight;
    //----------------------------------------------------------- Variable event
    let connecte;
    let chargementindicateur = false;
    let menucache = false;
    let titrecache = false;
    let hudcache = true;

    let joueur = new Personnage("invité", 0, 1);
    setContext("joueur", joueur);

    let toucheclavier;
    let classbouttonquitter = "bouttoncaché";
    let classbouttonconnexion = "";
    let connexionerror = false;
    let joueurenligne = [];
    let nbjoueurenligne;
    let effetfond;
    let faceimg = new Image(100, 200);
    faceimg.src = joueur.img;
    $: placeinventaire = joueur.inventaire.length;

    let camera;

    let difficulte = "normal";
    let enjeu = false;
    let spriteildaa;
    let spritesonde;
    let sondefinal = false;
    let acceuil;
    let bureau;
    let cursors;
    let spriteennemi;
    let spriteennemi2;
    let spriteennemi3;
    let spriteennemi4;
    let spriteennemi5;
    let etat = new Etats();
    let pseudoingame;
    let projectile;
    //---------------------------------------------------------------------
    let message = [
        "Onixyum ",
        "Nouveau sur Onixyum ?",
        "Mauvais pass ou pseudo déjà pris",
        "Un Pseudo*, un Pass* et c'est parti !"
    ];
    let effet = [
        new Audio("son/effet/ambiance.mp3"),
        new Audio(""),
        new Audio("son/effet/chat.mp3"),
        new Audio("son/effet/validation3.mp3")
    ];
    let fondacceuil = setInterval(() => {
        effet[0].play();
    }, 1000);
    let ildaa = [
        new Audio("son/effet/ildaabonjour.mp3"),
        new Audio("son/effet/ildaastrategie.mp3"),
        new Audio("son/effet/ildaacybershop.mp3"),
        new Audio("son/effet/ildaastrategie.mp3")
    ];
    let dopant = new Objet(
        "Stimulant",
        90,
        "img/potion.png",
        "consommable",
        "Un cocktail chimique stimulant",
        "+3 force"
    );
    let effetarme = [
        new Audio("son/effet/tirsimple.mp3"),
        new Audio("son/effet/tirsimple.mp3"),
        new Audio("son/effet/impact1.mp3"),
        new Audio("son/effet/impact1.mp3")
    ];

    //----------------------------------------------------------------------- Socket
    function testsocket() {
        let infos = {
            nom: joueur.pseudo,
            nb: nbjoueurenligne,
            id: joueur.pseudo
        };
        socket.on("disconnect", () => {
            socket.emit("deco", joueur.pseudo);
        });

        socket.emit("connexionenjeu", infos);
    }

    socket.on("alerteconnexion", (data) => {
        // console.log(data.nb);
        console.log(data.joueurs);

        joueurenligne = data.joueurs;
        nbjoueurenligne = data.nb--;
    });
    socket.on("alertedeconnexion", (data) => {
        nbjoueurenligne--;
        joueurenligne = data.joueurs;
    });
    socket.on("chatmaj", (data) => {
        console.log("mess chat");
    });
    // console.log("connection établie avec ildaa"); // true

    //--------------------------------------------------------------------- Fonctions

    function enregistrementjoueur(
        pseudo,
        cyberz,
        niveau,
        sante,
        attaque,
        defense,
        xp,
        pass,
        inventaire,
        kill,
        score,
        puce,
        amelioration,
        relique,
        coffres,
        classe,
        partenaire,
        progression,
        skin,
        personnage,
        img
    ) {
        fetch("https://apiildaa.herokuapp.com/connectionjoueur", {
            method: "post",
            mode: "cors",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                pseudo: pseudo,
                cyberz: cyberz,
                niveau: niveau,
                sante: sante,
                attaque: attaque,
                defense: defense,
                xp: xp,
                pass: pass,
                inventaire: inventaire,
                kill: kill,
                score: score,
                puce: puce,
                amelioration: amelioration,
                relique: relique,
                coffres: coffres,
                classe: classe,
                partenaire: partenaire,
                progression: progression,
                skin: skin,
                personnage: personnage,
                img: img
            })
        })
            .then((res) => res.json())
            .then((res) => {
                if (res === "error") {
                    console.log("erreur pseudo ou pass erroné");
                    chargementindicateur = false;
                    connexionerror = true;
                    return "error";
                } else {
                    let response = [];
                    response.push(res);
                    if (res.compte != undefined) {
                        /* console.log("nouveau compte créer"); */
                    }
                    joueur.pseudo = res.pseudo;
                    joueur.cyberz = res.cyberz;
                    joueur.niveau = res.niveau;
                    joueur.sante = res.sante;
                    joueur.attaque = res.attaque;
                    joueur.defense = res.defense;
                    joueur.xp = res.xp;
                    joueur.pass = res.pass;
                    joueur.inventaire = res.inventaire;
                    joueur.kill = res.kill;
                    joueur.score = res.score;
                    joueur.puce = res.puce;
                    joueur.amelioration = res.amelioration;
                    joueur.relique = res.relique;
                    joueur.coffres = res.coffres;
                    joueur.classe = res.classe;
                    joueur.partenaire = res.partenaire;
                    joueur.progression = res.progresson;
                    joueur.skin = res.skin;
                    joueur.personnage = res.personnage;
                    joueur.img = res.img;
                    chargementindicateur = false;
                    connecte = true;
                    menucache = true;
                    titrecache = true;
                    effet[0].volume = $volume;
                    joueur.inventaire.push(dopant);
                    console.log(joueur.inventaire);
                }
                /* console.log(res); */

                /* console.log(res.pseudo); */

                /* console.log(joueur.inventaire.length); */

                setTimeout(() => {
                    ildaa[0].volume = $volume;
                    ildaa[0].play();
                }, 2000);
            });
    }

    //---------------------------------------------------------------------------------------- Scene
    class Acceuil extends Phaser.Scene {
        constructor() {
            super("Acceuil");
        }
        //--------------------------------------------------------------------------------------- PRELOAD

        preload() {
            acceuil = this;

            // JOUEUR
            // joueur.inventaire.push(objet);
            // joueur.inventaire.push(objet2);
            // PNJ
            /*     spriteennemi =this.load.image("dude", "/img/boy.png", { frameWidth: 48, frameHeight: 48 });
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

                this.scene.start("Menuprincipal", "Acceuil");
            }
        }
    }
    //--------------------------------------------------------------------------------
    class Menuprincipal extends Phaser.Scene {
        constructor() {
            super("Menuprincipal");
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
            this.load.image("fondmenu", "img/session.png", {
                frameWidth: 1000,
                frameHeight: 500
            });
            this.load.image("fondmenu2", "img/session2.png", {
                frameWidth: 1000,
                frameHeight: 500
            });
            this.load.spritesheet("ildaa", "/img/ildaa.png", {
                frameWidth: 528,
                frameHeight: 842
            });
            this.load.spritesheet("sonde", "/img/sonde.png", {
                frameWidth: 120,
                frameHeight: 120
            });
        }

        //------------------------------------------------------ CREATE
        create() {
            spritesonde = this.physics.add.sprite(windowwidth - 250, windowheight - 450, "sonde");
            spritesonde.setSize(89, 92, true);
            spritesonde.setDepth(2);
            spriteildaa = this.physics.add.sprite(windowwidth - 350, windowheight - 100, "ildaa");
            spriteildaa.setSize(30, 80, true);
            spriteildaa.setDepth(2);
            camera = this.cameras.main;
            camera.fadeIn(1500, 1);
            // CREATION MAP
            this.background = this.add
                .image(this.sys.canvas.width / 2, this.sys.canvas.height / 2, "fondmenu")
                .setOrigin(0.5, 0.5);
            this.background.displayWidth = this.sys.canvas.width;
            this.background.displayHeight = this.sys.canvas.height;
            // CREATION JOUEUR
            // HITBOX
            this.background.setPipeline("Light2D");
            this.lights.enable();
            this.lights.setAmbientColor(0x808080);
            var spotlight = this.lights.addLight(300, 200, 1600).setIntensity(3);
            var spotlight2 = this.lights.addLight(1400, 200, 800).setIntensity(3);
            var spotlight3 = this.lights.addLight(690, 200, 800).setIntensity(3);
            var spotlight4 = this.lights.addLight(950, 300, 800).setIntensity(2);
            // // CREATION PARTICULE
            this.input.on("pointermove", function (pointer) {});
            toucheclavier = this.input.keyboard.createCursorKeys();
            effetfond = this.add
                .image(this.sys.canvas.width / 2, this.sys.canvas.height / 2, "fondmenu2")
                .setOrigin(0.5, 0.5);
            effetfond.displayWidth = this.sys.canvas.width;
            effetfond.displayHeight = this.sys.canvas.height;
            this.tweens.add({
                targets: effetfond,
                alpha: { from: 0, to: 1 },
                ease: "Sine.InOut",
                duration: 3000,
                repeat: -1,
                yoyo: true
            });

            this.anims.create({
                key: "ildaayeux",
                frames: this.anims.generateFrameNumbers("ildaa", {
                    frames: [
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                    ]
                }),
                frameRate: 8,
                repeat: -1
            });
            spriteildaa.play("ildaayeux");
            /* spritesonde.setVelocity(100, 200); */
            spritesonde.setBounce(1, 1);
            spritesonde.setCollideWorldBounds(true);
            // -----------------------------CREATION ANIMATION
            /* let opacite = 0;
            setInterval(() => {
                if (opacite >= 1) {
                    opacite = 0;
                    effetfond.setAlpha(opacite);
                } else {
                    opacite += 0.03;
                    effetfond.setAlpha(opacite);
                }
            }, 250); */
        }
        //-----------------------------------------------------------------------------------UPDATE
        update() {
            function mouvementsonde(x) {
                if (sondefinal) {
                    spritesonde.y += 0.1;
                    spritesonde.x += 0.1;
                } else {
                    spritesonde.y -= 0.2;

                    spritesonde.x -= 0.2;
                }
            }

            /*  this.physics.moveToObject(spritesonde, spriteildaa, 120); */
            mouvementsonde();
            if (spritesonde.y <= 270) {
                sondefinal = true;
            }
            if (spritesonde.y >= 310) {
                sondefinal = false;
            }
        }
    }

    class Bureau extends Phaser.Scene {
        constructor() {
            super("Bureau");
        }
        //--------------------------------------------------------------------------------------- PRELOAD

        preload() {
            this.load.spritesheet("ildaa2", "/img/ildaa.png", {
                frameWidth: 528,
                frameHeight: 757
            });
            this.load.spritesheet("dude", "/img/ildaa.png", {
                frameWidth: 528,
                frameHeight: 757
            });
            this.load.spritesheet("projectile", "/img/boule.png", {
                frameWidth: 409,
                frameHeight: 388
            });
            bureau = this;
            enjeu = true;
            connecte = false;
            cursors = this.input.keyboard.createCursorKeys();
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
            this.load.image("bureau", "img/testniveau4.png", {
                frameWidth: 1000,
                frameHeight: 500
            });
        }
        //------------------------------------------------------ CREATE
        create() {
            //------------------------------------------------------
            spriteildaa = this.physics.add.sprite(windowwidth - 900, windowheight - 380, "ildaa2");
            spriteildaa.setSize(228, 757, true);
            spriteildaa.setDepth(2);
            spriteildaa.setScale(0.5, 0.5);

            //-----------------------------------------
            spriteennemi = this.physics.add.sprite(windowwidth - 100, windowheight - 380, "dude");
            spriteennemi.setSize(228, 757, true);
            spriteennemi.setDepth(2);
            spriteennemi.setScale(0.5, 0.5);
            //------------------------------------------------
            spriteennemi2 = this.physics.add.sprite(windowwidth - 400, windowheight - 380, "dude");
            spriteennemi2.setSize(228, 757, true);
            spriteennemi2.setDepth(2);
            spriteennemi2.setScale(0.5, 0.5);
            // CREATION MAP
            camera = this.cameras.main;
            camera.fadeIn(3000, 1);
            // camera.setZoom(2);
            this.background = this.add
                .image(this.sys.canvas.width / 2, this.sys.canvas.height / 2, "bureau")
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
            spriteildaa.body.collideWorldBounds = true;
            spriteennemi.body.collideWorldBounds = true;
            spriteennemi2.body.collideWorldBounds = true;
            this.physics.add.collider(
                spriteildaa,
                [spriteennemi, spriteennemi2],
                function colision(persosprite, collisionsprite) {
                    etat.stun(joueur);

                    camera.shake(1000, 0.025);
                }
            );
            this.physics.add.collider(
                spriteennemi,
                [spriteennemi2],
                function colision(persosprite, collisionsprite) {
                    etat.stun(joueur);

                    camera.shake(1000, 0.025);
                }
            );

            this.anims.create({
                key: "dos",
                frames: this.anims.generateFrameNumbers("ildaa2", {
                    frames: [3, 6, 3, 7]
                }),
                frameRate: 3,
                repeat: -1
            });
            this.anims.create({
                key: "gauche",
                frames: this.anims.generateFrameNumbers("ildaa2", {
                    frames: [4, 4, 4, 4]
                }),
                frameRate: 3,
                repeat: -1
            });
            this.anims.create({
                key: "droite",
                frames: this.anims.generateFrameNumbers("ildaa2", {
                    frames: [5, 10, 5, 10]
                }),
                frameRate: 3,
                repeat: -1
            });
            this.anims.create({
                key: "bas",
                frames: this.anims.generateFrameNumbers("ildaa2", {
                    frames: [0, 0, 0, 0]
                }),
                frameRate: 3,
                repeat: -1
            });
            var style = {
                font: "10px scifi",
                fill: "chartreuse",
                wordWrap: true,
                wordWrapWidth: spriteildaa.width,
                align: "center"
            };
            pseudoingame = this.add.text(spriteildaa.x, spriteildaa.y, joueur.pseudo, style);
            console.log(cursors);
            let scenebureau = this;
            //TOUCHE ESPACE
            cursors.space.on("down", function (event) {
                if (joueur.vitesse != 0 && joueur.vitesse === 1) {
                    if (effetarme[0].paused) {
                        effetarme[0].volume = 0.1;
                        effetarme[0].play();
                    } else {
                        effetarme[1].volume = 0.1;
                        effetarme[1].play();
                    }

                    if (projectile === undefined) {
                        projectile = scenebureau.physics.add.sprite(
                            spriteildaa.x,
                            spriteildaa.y - 90,
                            "projectile"
                        );
                        projectile.setSize(409, 388, true);
                        projectile.setDepth(2);
                        projectile.setScale(0.25, 0.25);
                        projectile.setVelocity(2000, 0);

                        scenebureau.physics.add.collider(
                            projectile,
                            [spriteennemi, spriteennemi2],
                            function colision(persosprite, collisionsprite) {
                                projectile.destroy();
                                if (effetarme[2].paused) {
                                    effetarme[2].volume = 0.1;
                                    effetarme[2].play();
                                } else {
                                    effetarme[3].volume = 0.1;
                                    effetarme[3].play();
                                }

                                collisionsprite.destroy();
                            }
                        );
                        setTimeout(() => {
                            projectile.destroy();
                            projectile = undefined;
                        }, 5000);
                    } else {
                        let projectile2 = scenebureau.physics.add.sprite(
                            spriteildaa.x,
                            spriteildaa.y - 90,
                            "projectile"
                        );
                        scenebureau.physics.add.collider(
                            projectile2,
                            [spriteennemi, spriteennemi2],
                            function colision(persosprite, collisionsprite) {
                                projectile2.destroy();
                                if (effetarme[2].paused) {
                                    effetarme[2].play();
                                } else {
                                    effetarme[3].play();
                                }
                                collisionsprite.destroy();
                            }
                        );
                        projectile2.setSize(409, 388, true);
                        projectile2.setDepth(2);
                        projectile2.setScale(0.25, 0.25);
                        projectile2.setVelocity(2000, 0);

                        setTimeout(() => {
                            projectile2.destroy();
                            projectile2 = undefined;
                        }, 5000);
                    }
                }

                //  perso.play("walk");
            });

            // TOUCHE HAUT
            cursors.up.on("down", function (event) {
                if (joueur.vitesse != 0 && joueur.vitesse === 1) {
                    spriteildaa.play("dos");
                    //  perso.play("walk");
                    spriteildaa.setVelocity(0, -300);
                }
            });
            // TOUCHE BAS
            cursors.down.on("down", function (event) {
                if (joueur.vitesse != 0 && joueur.vitesse === 1) {
                    spriteildaa.setVelocity(0, 300);
                }
                spriteildaa.play("bas");
            });
            // TOUCHE GAUCHE
            cursors.left.on("down", function (event) {
                if (joueur.vitesse != 0 && joueur.vitesse === 1) {
                    spriteildaa.play("gauche");
                    spriteildaa.setVelocity(-300, 0);
                }
            });
            //TOUCHE DROITE
            cursors.right.on("down", function (event) {
                if (joueur.vitesse != 0 && joueur.vitesse === 1) {
                    spriteildaa.play("droite");
                    spriteildaa.setVelocity(300, 0);
                }
            });
        }
        //-----------------------------------------------------------------------------------UPDATE
        update() {
            //TOUCHE BAS

            cursors.down.on("up", function (event) {
                //  perso.play("walk");
                spriteildaa.setVelocity(0, 0);
            });
            //TOUCHE HAUT

            cursors.up.on("up", function (event) {
                //  perso.play("walk");
                spriteildaa.setVelocity(0, 0);
            });
            //TOUCHE GAUCHE

            cursors.left.on("up", function (event) {
                //  perso.play("walk");
                spriteildaa.setVelocity(0, 0);
            });

            cursors.right.on("up", function (event) {
                //  perso.play("walk");
                spriteildaa.setVelocity(0, 0);
            });
        }
    }
    const config = {
        width: 1380,
        height: windowheight,
        pixelArt: false,
        scene: [Acceuil, Menuprincipal, Bureau],
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

<!------------------------------------------------------------------------------------------ HTML------------------------------->

<svelte:window
    on:keydown={(event) => {
        if (event.key === "p") {
            if ($focuschat === true) {
                console.log($focuschat + "est true");
            } else {
                console.log($focuschat + "est false");
            }
            console.log("touche p !");
            console.log(joueur);
        }
        /* console.log(event); */
    }}
    on:mousemove={() => {}}
    on:contextmenu={(e) => {
        e.preventDefault();
    }}
/>

<div id="menu" class={menucache ? "menucache" : ""}>
    <div class="info">
        <p id="titrejeu">{message[0]}</p>
    </div>

    <input
        placeholder="Pseudo*"
        bind:value={joueur.pseudo}
        id="input3"
        maxlength="9"
        autocomplete="off"
        onfocus="this.value=''"
    />
    <input
        placeholder="Pass*"
        bind:value={joueur.pass}
        id="input"
        maxlength="9"
        autocomplete="off"
        onfocus="this.value=''"
    />
    <button
        class={classbouttonconnexion}
        id="connexionboutton"
        on:click={() => {
            effet[3].volume = 0.5;
            effet[3].play();
            enregistrementjoueur(
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
                joueur.relique,
                joueur.coffres,
                joueur.classe,
                joueur.partenaire,
                joueur.progression,
                joueur.skin,
                joueur.personnage,
                joueur.img
            );

            {
                chargementindicateur = true;
                // hudcache = false;
            }
            {
                classbouttonquitter = "";
            }
            {
                classbouttonconnexion = "bouttoncaché";
            }
            testsocket();
        }}>Connexion</button
    >

    <div class="info2">
        <p class="textinfo">{message[1]}</p>
        <img src="img/infoobjet.png" alt="" />
    </div>
    {#if connexionerror}
        <p class="textinfoerror">{message[2]}</p>
        <button
            id="recommencer"
            on:click={(event) => {
                window.location.reload();
            }}>recommencer</button
        >
    {/if}
    <img
        src="/img/glitter3.png"
        alt=""
        id="indicateur"
        class={chargementindicateur === true ? "indicateurtourne" : "indicateur"}
    />
</div>
{#if !titrecache}<img id="titre" src="img/titre2.png" alt="" />{/if}
{#if connecte}
    <button
        id="storymode"
        on:click={(event) => {
            acceuil.scene.start("Bureau", "Menuprincipal");
            camera.fadeOut(3000, 1);
            effet[0].pause();
            clearInterval(fondacceuil);
        }}>Mode Histoire</button
    >
    <button
        id="jcjmode"
        on:click={async (event) => {
            await window.Neutralino.window.setDraggableRegion("jcjmode");
        }}>Mode JcJ</button
    >
    <!-- <Hud
        bind:pseudo={joueur.pseudo}
        bind:cyberz={joueur.cyberz}
        bind:niv={joueur.niveau}
        bind:barredevie={joueur.sante}
        bind:sante={joueur.sante}
        bind:xp={joueur.xp}
        bind:srcface={faceimg}
        bind:kill={joueur.kill}
        bind:score={joueur.score}
        bind:inventaire={joueur.inventaire}
        bind:placeinventaire
    /> -->
{/if}
<div class={connecte === true ? "chatvisible" : "chatinvisible"}>
    <Chat />
    <Options />
    <p id="version">version 1.0</p>
    <img
        id="quitter"
        src="img/quitter.png"
        alt=""
        on:click={async () => {
            await window.Neutralino.app.exit();
        }}
    />
</div>

{#if enjeu}
    <div>
        <Inventairejeu
            bind:inventairejoueur={joueur.inventaire}
            bind:placeinventaire
            bind:cyberz={joueur.cyberz}
        />
    </div>{/if}

<div id="jeu" />

<!------------------------------------------------------------------------------CSS-------------------------------------------->
<style>
    @keyframes briller {
        from {
            opacity: 30%;
        }
        to {
            opacity: 100%;
        }
    }

    @keyframes tourner {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
    #titrejeu {
        margin-top: 0px;
        padding: 0;
    }
    #quitter {
        position: fixed;
        bottom: 35px;
        right: 145px;
        margin: 1px;
    }
    #quitter:hover {
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000;
        cursor: url("/img/mouse2.png"), pointer;
        background-color: rgb(217, 0, 0);
        border-radius: 50%;
    }
    #input3 {
        margin-bottom: 5px;
    }

    #titre {
        position: absolute;
        top: 150px;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: briller 2s infinite alternate;
    }
    .bouttoncaché {
        display: none;
        z-index: 0;
        cursor: initial;
    }
    .menucache {
        opacity: 0;
    }
    .indicateur {
        margin-top: 8px;
    }
    .indicateurtourne {
        animation: tourner infinite 0.2s linear;
    }
    #menu {
        left: 70px;
        top: 195px;
        padding-top: 15px;
        row-gap: 20px;
        width: 180px;
        height: 300px;
        margin: 5px;
        background-color: rgba(71, 71, 71, 0.26);
        z-index: 3;
        position: fixed;

        flex-direction: column;
        align-items: center;
        font-family: "scifi";
        border: solid 1px rgb(179, 0, 0);
        border-radius: 12px;
        font-family: "scifi";
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000;
    }
    input {
        width: 70%;
        font-size: 15px;
        font-family: "scifi";
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000;
        background-color: rgb(39, 39, 39);
        outline: none;
        color: rgb(255, 255, 255);
        text-shadow: 0.4px 0.4px rgb(0, 0, 0);
    }
    input::placeholder {
        color: #000000;
    }
    button {
        font-family: "scifi";
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000;
        background-color: black;
        border-radius: 12px;
        cursor: url("/img/mouse2.png"), pointer;
        color: rgb(92, 255, 247);
    }
    .textinfoerror {
        font-size: 11px;
        color: red;
    }
    #recommencer:hover {
        color: rgb(255, 0, 0);
        box-shadow: 0px 0px 10px rgb(255, 0, 0), 0px 0px 10px #000000;
    }
    #recommencer {
        position: absolute;
        top: 300px;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    #connexionboutton {
        margin-top: 15px;
        margin-bottom: 20px;
    }
    #connexionboutton:hover {
        color: rgb(255, 0, 0);
        box-shadow: 0px 0px 10px rgb(255, 0, 0), 0px 0px 10px #000000;
    }
    .textinfo {
        color: white;
        font-size: 13px;
    }
    .info {
        text-align: center;
        font-size: 15px;
        color: rgb(255, 255, 255);
        text-shadow: 6px 5px 4px black;
        margin-top: 5px;
        line-height: 19px;
    }
    .info2 {
        position: relative;
    }
    .info2 > img {
        position: absolute;
        top: 17px;
        right: 9px;
        cursor: url("/img/mouse2.png"), pointer;
    }
    .info2 > img:hover {
        box-shadow: 0px 0px 10px rgb(255, 0, 0), 0px 0px 10px #000000;
        background-color: black;
        border-radius: 45%;
        width: fit-content;
    }
    .info > p {
        align-self: center;
        justify-self: center;
        text-align: center;
        padding: 10px;
        font-size: 17px;
    }
    .chatinvisible {
        display: none;
    }
    #storymode {
        position: fixed;
        top: 155px;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 35px;
    }
    #storymode:hover {
        color: #ffcc00;
    }
    #jcjmode {
        position: fixed;
        top: 255px;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 35px;
        color: #6a6a6a;
    }
    #jcjmode:hover {
        color: #ee0000;
    }
    #version {
        position: fixed;
        right: 25px;
        bottom: 20px;
    }
</style>
