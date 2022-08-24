<script>
    import Equipement from "./Equipement.svelte";
    import Cybershop from "./Cybershop.svelte";
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
        effetarme,
        effetambiance,
        effetsprite,
        directionsprite,
        nbjoueursenligne,
        joueursenligne,
        contenuchat,
        connecte,
        enjeu,
        cursors,
        spriteildaa,
        joueur,
        genius
    } from "./Class.js";
    import { socket, sauvegarde } from "./Variables.js";
    import Chat from "./Chat.svelte";
    import Hud from "./Hud.svelte";
    import Inventairejeu from "./Inventairejeu.svelte";
    import Social from "./Social.svelte";

    import Options from "./Options.svelte";
    import Contact from "./Contact.svelte";
    import { getContext, setContext } from "svelte";

    //----------------------------------------------------------------------------------- Variables

    /* async function demarrage() {
        await Neutralino.window.move(0, 0);
    }
    demarrage(); */

    //----------------------------------------------------------- Variable event

    let chargementindicateur = false;
    let menucache = false;
    let titrecache = false;
    let hudcache = true;
    let input;
    
    let toucheclavier;
    let classbouttonquitter = "bouttoncaché";
    let classbouttonconnexion = "";
    let connexionerror = false;

    let effetfond;
    let faceimg = new Image(100, 200);
    faceimg.src = $joueur.img;
    $: placeinventaire = $joueur.inventaire.length;

    let camera;

    let difficulte = "normal";

    let spritesonde;
    let sondefinal = false;
    let acceuil;
    let bureau;

    let spriteennemi;
    let spriteennemi2;
    let spriteennemi3;
    let spriteennemi4;
    let spriteennemi5;
    let etat = new Etats();
    let pseudoingame;
    let projectile;
    onMount(async () => {});
    //---------------------------------------------------------------------
    /*  onMount(() => {
        input.focus();  // input dom selector ( input pass -bind:this etc- )
    }); */
    let message = [
        "Onixyum v 1.0 ",
        "Nouveau sur Onixyum ?",
        "Mauvais pass ou pseudo déjà pris",
        "Un Pseudo*, un Pass* et c'est parti !"
    ];

    let fondacceuil = setInterval(() => {
        effetambiance.acceuil.volume = 0.5;
        effetambiance.acceuil.play();
    }, 1000);

    let dopant = new Objet(
        "Stimulant",
        90,
        "img/potion.png",
        "Consommable",
        "Un cocktail chimique stimulant de force",
        "+3 force (20sec)",
        "Onix Corp.",
        "Basique",
        0,
        20
    );
    socket.on("connectionok", (data) => {
        if (data.pseudo === $joueur.pseudo) {
            $joueur = data.joueur;
            $connecte = true;
            menucache = true;
            titrecache = true;
        } else {
            return;
        }
    });
    socket.on("nouveaucompte", (data) => {
        if (data.pseudo === $joueur.pseudo) {
            $joueur = data;
            $connecte = true;
            menucache = true;
            titrecache = true;
        } else {
            return;
        }
    });
    socket.on("erreurcompte", (data) => {
        chargementindicateur = false;
        connexionerror = true;
    });

    //----------------------------------------------------------------------- Socket
    function testsocket() {
        let infos = {
            nom: $joueur.pseudo,
            nb: nbjoueursenligne,
            id: joueur.pseudo
        };
        socket.on("disconnect", () => {
            $joueursenligne = data.joueurs;
            socket.emit("deco", $joueur.pseudo);
        });

        socket.emit("connexionenjeu", infos);
    }
    socket.on("nouvelleconnexion", (data) => {
        $joueursenligne = data.joueurs;
        $contenuchat = data.contenuchat;
    });

    socket.on("alerteconnexion", (data) => {
        // console.log(data.nb);
        /*   console.log(data.joueurs); */

        $joueursenligne.push(joueur.pseudo);
        $nbjoueursenligne = data.nb--;
    });
    socket.on("alertedeconnexion", (data) => {
        $nbjoueursenligne--;
        $joueursenligne = data.joueurs;
    });
    socket.on("chatmaj", (data) => {
        console.log("mess chat");
    });
    socket.on("ventecybershop", (data) => {
        if (data.pseudovendeur === $joueur.pseudo) {
            effetui.ventecybershop.volume = 0.1;
            effetui.ventecybershop.play();
            $joueur.cyberz = data.argent;
        }
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
        vitesse,
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
        partenaire2,
        partenaire3,
        progression,
        skin,
        personnage,
        img,
        skills,
        consommables,
        alignement,
        materiauxonix,
        materiauxchimique,
        ventes,
        messages,
        gemmes,
        mail,
        amis,
        pet,
        pet2,
        pet3
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
                vitesse: vitesse,
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
                partenaire2: partenaire2,
                partenaire3: partenaire3,
                progression: progression,
                skin: skin,
                personnage: personnage,
                img: img,
                skills: skills,
                consommables: consommables,
                alignement: alignement,
                materiauxonix: materiauxonix,
                materiauxchimique: materiauxchimique,
                ventes: ventes,
                messages: messages,
                gemmes: gemmes,
                mail: mail,
                amis: amis,
                pet: pet,
                pet2: pet2,
                pet3: pet3
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
                    joueur.vitesse = res.vitesse;
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
                    joueur.partenaire2 = res.partenaire2;
                    joueur.partenaire3 = res.partenaire3;
                    joueur.progression = res.progresson;
                    joueur.skin = res.skin;
                    joueur.personnage = res.personnage;
                    joueur.img = res.img;
                    joueur.skills = res.skills;
                    joueur.consommables = res.consommables;
                    joueur.alignement = res.alignement;
                    joueur.materiauxonix = res.materiauxonix;
                    joueur.materiauxchimique = res.materiauxchimique;
                    joueur.ventes = res.ventes;
                    joueur.messages = res.messages;
                    joueur.gemmes = res.gemmes;
                    joueur.mail = res.mail;
                    joueur.amis = res.amis;
                    joueur.pet = res.pet;
                    joueur.pet2 = res.pet2;
                    joueur.pet3 = res.pet3;
                    $connecte = true;
                    menucache = true;
                    titrecache = true;

                    joueur.inventaire.push(dopant);
                }
                /* console.log(res); */

                /* console.log(res.pseudo); */

                /* console.log(joueur.inventaire.length); */
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
            /* this.lights.enable(); */
            // this.lights.setAmbientColor(55, 55, 255);
            /* var spotlight = this.lights.addLight(300, 300, 1600).setIntensity(3);
            var spotlight2 = this.lights.addLight(1400, 200, 800).setIntensity(3);
            var spotlight3 = this.lights.addLight(690, 200, 800).setIntensity(3);
            var spotlight4 = this.lights.addLight(950, 300, 800).setIntensity(2); */
            // // CREATION PARTICULE
            this.input.on("pointermove", function (pointer) {});
            toucheclavier = this.input.keyboard.createCursorKeys();
            // -----------------------------CREATION ANIMATION
        }
        //-----------------------------------------------------------------------------------UPDATE
        update() {
            if ($connecte === true) {
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
                frameHeight: 757
            });
            this.load.spritesheet("sonde", "/img/sonde.png", {
                frameWidth: 120,
                frameHeight: 120
            });
        }

        //------------------------------------------------------ CREATE
        create() {
            spritesonde = this.physics.add.sprite(1150, 300, "sonde");
            spritesonde.setSize(89, 92, true);
            spritesonde.setDepth(2);
            $spriteildaa = this.physics.add.sprite(1000, 650, "ildaa");
            $spriteildaa.setSize(30, 80, true);
            $spriteildaa.setDepth(2);
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
            /*    this.background.setPipeline("Light2D");
            this.lights.enable();
            this.lights.setAmbientColor(0x808080);
            var spotlight = this.lights.addLight(300, 200, 1600).setIntensity(3);
            var spotlight2 = this.lights.addLight(1400, 200, 800).setIntensity(3);
            var spotlight3 = this.lights.addLight(690, 200, 800).setIntensity(3);
            var spotlight4 = this.lights.addLight(950, 300, 800).setIntensity(2); */
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
            $spriteildaa.play("ildaayeux");
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

    // NIVEAU 1 --------------------------------------------------------------------------------------------------------------------------------------------

    class Bureau extends Phaser.Scene {
        constructor() {
            super("Bureau");
        }
        //--------------------------------------------------------------------------------------- PRELOAD

        preload() {
            this.load.spritesheet("sonde", "/img/sonde.png", {
                frameWidth: 120,
                frameHeight: 120
            });
        
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
            setTimeout(() => {
                $enjeu = true;
            }, 3000);

            $connecte = false;
            $cursors = this.input.keyboard.createCursorKeys();
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
            this.load.image("bureau", "img/niveau1.png", {
                frameWidth: 1000,
                frameHeight: 500
            });
        }
        //------------------------------------------------------ CREATE
        create() {
            let scenebureau = this;
           
            spritesonde = this.physics.add.sprite(1150, 300, "sonde").setInteractive(this.input.makePixelPerfect()).setImmovable();
            spritesonde.setSize(89, 92, true);
            spritesonde.setDepth(2);
            //------------------------------------------------------
            $spriteildaa = this.physics.add.sprite(900, 380, "ildaa2").setInteractive(this.input.makePixelPerfect());;
             $spriteildaa.setSize(228, 757, true); 
            $spriteildaa.setDepth(2);
            $spriteildaa.setScale(0.5, 0.5);

            //-----------------------------------------
            spriteennemi = this.physics.add.sprite(100, 380, "dude");
            spriteennemi.setSize(228, 757, true);
            spriteennemi.setDepth(2);
            spriteennemi.setScale(0.5, 0.5);
            //------------------------------------------------
            spriteennemi2 = this.physics.add.sprite(400, 380, "dude");
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
            this.trees = this.add.tileSprite(0, 280, 800, 820, "projectile").setOrigin(0, 0);
            // CREATION JOUEUR
            // HITBOX
            /* this.background.setPipeline("Light2D"); */
            /*  this.lights.enable(); */
            /* this.lights.setAmbientColor(55, 55, 255); */
            // var spotlight = this.lights.addLight(300, 300, 1600).setIntensity(3);
            /*  var light = this.lights.addLight(500, 0, 1600).setIntensity(10); */

            // // CREATION PARTICULE
            this.input.on("pointermove", function (pointer) {});
            toucheclavier = this.input.keyboard.createCursorKeys();
            // -----------------------------CREATION ANIMATION
            $spriteildaa.body.collideWorldBounds = true;
            spriteennemi.body.collideWorldBounds = true;
            spriteennemi2.body.collideWorldBounds = true;
            spritesonde.body.collideWorldBounds = true;
            this.physics.add.collider(
                $spriteildaa,
                [spriteennemi, spriteennemi2,spritesonde],
                function colision(persosprite, collisionsprite) {
                    etat.stun($joueur);
                    $joueur.vitesse = 0;
                    setTimeout(() => {
                        $joueur.vitesse = 1;
                        console.log($joueur.vitesse);
                        $joueur.sante = 1;
                    }, 2000);
                    camera.shake(1000, 0.025);
                }
            );
            this.physics.add.collider(
                spriteennemi,
                [spriteennemi2],
                function colision(persosprite, collisionsprite) {
                    etat.stun($joueur);

                    camera.shake(1000, 0.025);
                }
            );
            //ANIMATIONS --------------------------------------------------------------

            this.anims.create({
                key: "dos",
                frames: this.anims.generateFrameNumbers("ildaa2", {
                    frames: [3, 6, 7]
                }),
                frameRate: 6,
                repeat: -1
            });
            this.anims.create({
                key: "gauche",
                frames: this.anims.generateFrameNumbers("ildaa2", {
                    frames: [4, 12, 4, 13]
                }),
                frameRate: 6,
                repeat: -1
            });
            this.anims.create({
                key: "droite",
                frames: this.anims.generateFrameNumbers("ildaa2", {
                    frames: [5, 10, 5, 11]
                }),
                frameRate: 6,
                repeat: -1
            });
            this.anims.create({
                key: "bas",
                frames: this.anims.generateFrameNumbers("ildaa2", {
                    frames: [0, 0, 0, 14]
                }),
                frameRate: 6,
                repeat: -1
            });
            // TEXT EN JEU ---------------------------------------------------------------
            // var style = {
            //     font: "10px scifi",
            //     fill: "chartreuse",
            //     wordWrap: true,
            //     wordWrapWidth: spriteildaa.width,
            //     align: "center"
            // };
            // pseudoingame = this.add.text(spriteildaa.x, spriteildaa.y, joueur.pseudo, style);

            //TOUCHE ESPACE
            $cursors.space.on("down", function (event) {
                if ($pause != true && $focuschat != true) {
                    if ($joueur.vitesse != 0 && $joueur.vitesse === 1) {
                        if (effetarme.tir.paused) {
                            effetarme.tir.volume = 0.1;
                            effetarme.tir.play();
                        } else {
                            effetarme.tirbis.volume = 0.1;
                            effetarme.tirbis.play();
                        }

                        if (projectile === undefined) {
                            projectile = scenebureau.physics.add.sprite(
                                $spriteildaa.x,
                                $spriteildaa.y - 90,
                                "projectile"
                            );
                            projectile.setSize(406, 50, true);
                            projectile.setDepth(2);
                            projectile.setScale(0.5, 0.25);
                            projectile.setVelocity(2000, 0);

                            scenebureau.physics.add.collider(
                                projectile,
                                [spriteennemi, spriteennemi2],
                                function colision(persosprite, collisionsprite) {
                                    projectile.destroy();
                                    if (effetarme.impact.paused) {
                                        effetarme.impact.volume = 0.1;
                                        effetarme.impact.play();
                                    } else {
                                        effetarme.impactbis.volume = 0.1;
                                        effetarme.impactbis.play();
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
                                $spriteildaa.x,
                                $spriteildaa.y - 90,
                                "projectile"
                            );
                            scenebureau.physics.add.collider(
                                projectile2,
                                [spriteennemi, spriteennemi2],
                                function colision(persosprite, collisionsprite) {
                                    projectile2.destroy();
                                    if (effetarme.impact.paused) {
                                        effetarme.impact.volume = 0.1;
                                        effetarme.impact.play();
                                    } else {
                                        effetarme.impactbis.volume = 0.1;
                                        effetarme.impactbis.play();
                                    }
                                    collisionsprite.destroy();
                                }
                            );
                            projectile2.setSize(406, 50, true);
                            projectile2.setDepth(2);
                            projectile2.setScale(0.5, 0.25);
                            projectile2.setVelocity(2000, 0);

                            setTimeout(() => {
                                projectile2.destroy();
                                projectile2 = undefined;
                            }, 5000);
                        }
                    } else {
                        return;
                    }
                }

                //  perso.play("walk");
            });

            // TOUCHE HAUT
            $cursors.up.on("down", function (event) {
                /* scenebureau.scene.switch("Menuprincipal"); */
                if ($pause != true) {
                    if ($joueur.vitesse != 0 && $joueur.vitesse === 1) {
                        $spriteildaa.play("dos");
                        //  perso.play("walk");
                        $spriteildaa.setVelocity(0, -200);
                    }
                } else {
                    return;
                }
            });
            // TOUCHE BAS
            $cursors.down.on("down", function (event) {
                if ($pause != true) {
                    if ($joueur.vitesse != 0 && $joueur.vitesse === 1) {
                        $spriteildaa.setVelocity(0, 200);
                    }
                    $spriteildaa.play("bas");
                } else {
                    return;
                }
            });
            // TOUCHE GAUCHE
            $cursors.left.on("down", function (event) {
                if ($pause != true) {
                    if ($joueur.vitesse != 0 && $joueur.vitesse === 1) {
                        $spriteildaa.play("gauche");
                        $spriteildaa.setVelocity(-330, 0);
                    }
                } else {
                    return;
                }
            });
            //TOUCHE DROITE
            $cursors.right.on("down", function (event) {
                if ($pause != true) {
                    if ($joueur.vitesse != 0 && $joueur.vitesse === 1) {
                        $spriteildaa.play("droite");
                        $spriteildaa.setVelocity(330, 0);
                    }
                } else {
                    return;
                }
            });
        }
        //-----------------------------------------------------------------------------------UPDATE
        update() {
            //TOUCHE BAS

            $cursors.down.on("up", function (event) {
                $spriteildaa.stop();
                //  perso.play("walk");
                $spriteildaa.setVelocity(0, 0);
            });
            //TOUCHE HAUT

            $cursors.up.on("up", function (event) {
                $spriteildaa.stop();
                //  perso.play("walk");
                $spriteildaa.setVelocity(0, 0);
            });
            //TOUCHE GAUCHE

            $cursors.left.on("up", function (event) {
                $spriteildaa.stop();
                //  perso.play("walk");
                $spriteildaa.setVelocity(0, 0);
            });

            $cursors.right.on("up", function (event) {
                $spriteildaa.stop();
                //  perso.play("walk");
                $spriteildaa.setVelocity(0, 0);
            });
            if ($cursors.up.isDown) {
                if ($pause != true) {
                    effetsprite.pas.volume = 0.1;

                    effetsprite.pas.playbackRate = 4.5;
                    if (effetsprite.pas.paused) {
                        effetsprite.pas.play();
                    }
                } else {
                    return;
                }
            }
            if ($cursors.down.isDown) {
                effetsprite.pas.volume = 0.1;

                effetsprite.pas.playbackRate = 4.5;
                if (effetsprite.pas.paused) {
                    effetsprite.pas.play();
                }
            }
            if ($cursors.left.isDown) {
                effetsprite.pas.volume = 0.1;

                effetsprite.pas.playbackRate = 4.5;
                if (effetsprite.pas.paused) {
                    effetsprite.pas.play();
                }
            }
            if ($cursors.right.isDown) {
                effetsprite.pas.volume = 0.1;

                effetsprite.pas.playbackRate = 4.5;
                if (effetsprite.pas.paused) {
                    effetsprite.pas.play();
                }
            }
            this.trees.tilePositionX -= 6;
        }
    }

    const config = {
        width: 1380,
        height: 730,
        pixelArt: false,
        scene: [Acceuil, Menuprincipal, Bureau],
        type: Phaser.AUTO,
        resolution: window.devicePixelRatio,
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
            console.log($joueur);
        }
        /* console.log(event); */
    }}
    on:mousemove={() => {}}
    on:contextmenu={(e) => {
        e.preventDefault();
    }}
/>

<div id="menu" class={menucache ? "menucache" : ""}>
    <img id="fondmenu" src="img/menu.png" alt="" />
    <div class="info">
        <p id="titrejeu">{message[0]}</p>
    </div>

    <input
        placeholder="Pseudo*"
        bind:value={$joueur.pseudo}
        id="input3"
        maxlength="9"
        autocomplete="off"
        on:focus={(e) => {
            effetui.selection.volume = 0.1;
            effetui.selection.play();
            e.target.value = "";
        }}
    />
    <input
        placeholder="Pass*"
        bind:value={$joueur.pass}
        id="input"
        maxlength="9"
        autocomplete="off"
        on:focus={(e) => {
            effetui.selection.volume = 0.1;
            effetui.selection.play();
            e.target.value = "";
        }}
        bind:this={input}
    />
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <button
        class={classbouttonconnexion}
        id="connexionboutton"
        on:click={() => {
            effetui.valider.volume = 0.1;
            effetui.valider.play();

            /*  enregistrementjoueur(
                joueur.pseudo,
                joueur.cyberz,
                joueur.niveau,
                joueur.sante,
                joueur.attaque,
                joueur.defense,
                joueur.vitesse,
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
                joueur.partenaire2,
                joueur.partenaire3,
                joueur.progression,
                joueur.skin,
                joueur.personnage,
                joueur.img,
                joueur.skills,
                joueur.consommables,
                joueur.alignement,
                joueur.materiauxonix,
                joueur.materiauxchimique,
                joueur.ventes,
                joueur.messages,
                joueur.gemmes,
                joueur.mail,
                joueur.amis,
                joueur.pet,
                joueur.pet2,
                joueur.pet3
            );
 */ socket.emit("enregistrement", $joueur);

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
        }}
        on:mouseover={() => {
            effetui.hover.volume = 0.1;
            effetui.hover.play();
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
{#if $connecte}
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <button
        id="storymode"
        on:click={(event) => {
            acceuil.scene.start("Bureau", "Menuprincipal");
            acceuil.scene.remove("Menuprincipal");

            /* camera.fadeOut(1000, 1); */
            effetambiance.acceuil.pause();
            clearInterval(fondacceuil);
            let fondcomplexe = setInterval(() => {
                effetambiance.complexe.volume = 0.5;
                effetambiance.complexe.play();
            }, 1000);
        }}
        on:mouseover={() => {
            effetui.hover.volume = 0.1;
            effetui.hover.play();
        }}>Mode Histoire</button
    >
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <button
        id="jcjmode"
        on:click={async (event) => {
            effetui.error.volume = 0.1;
            effetui.error.play();
            /* await window.Neutralino.window.setDraggableRegion("jcjmode"); */
        }}
        on:mouseover={() => {
            effetui.hover.volume = 0.1;
            effetui.hover.play();
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
<div class={$connecte === true ? "chatvisible" : "chatinvisible"}>
    <!-- <Chat /> -->
    <Options />
    <p id="version">version 1.0</p>
    <!-- svelte-ignore a11y-mouse-events-have-key-events -->
    <img
        id="quitter"
        src="img/quitter.png"
        alt=""
        on:click={async () => {
            effetui.valider.volume = 0.1;
            effetui.valider.play();
            await window.Neutralino.app.exit();
        }}
        on:mouseover={() => {
            effetui.hover.volume = 0.1;
            effetui.hover.play();
        }}
    />
</div>

{#if $enjeu}
    <div id="menujeu">
        <Inventairejeu
            bind:inventairejoueur={$joueur.inventaire}
            bind:placeinventaire
            bind:cyberz={$joueur.cyberz}
            bind:materiauxonix={$joueur.materiauxonix}
            bind:materiauxchimique={$joueur.materiauxchimique}
        />
        <Equipement />
        <Social />
        <Cybershop />
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
        margin-top: 25px;
        padding: 0;
        font-size: 10px;
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
        margin-bottom: 15px;
    }

    #titre {
        position: absolute;
        top: 260px;
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
        display: none;
    }
    .indicateur {
        margin-top: 4px;
    }
    .indicateurtourne {
        animation: tourner infinite 0.2s linear;
    }
    /*   #menujeu {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    } */
    #menu {
        left: 50%;
        top: 75%;
        transform: translate(-50%, -50%);

        row-gap: 20px;
        width: 180px;
        height: 300px;
        margin: 5px;
        background-color: rgba(71, 71, 71, 0.26);
        z-index: 1;
        position: fixed;

        flex-direction: column;
        align-items: center;
        font-family: "scifi";
        border: solid 2px rgb(0, 0, 0);
        border-radius: 15px;
        font-family: "scifi";
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000;
    }
    #fondmenu {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: -1;
        border-radius: 14px;
        border: solid 2px black;
    }
    input {
        width: 70%;
        font-size: 15px;
        font-family: "scifi";
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000;
        background-color: rgb(0, 0, 0);
        outline: none;
        color: rgb(198, 0, 247);
        text-shadow: 0.4px 0.4px rgb(0, 0, 0);
    }
    input::placeholder {
        color: #2d2d2d;
    }
    button {
        font-family: "scifi";
        box-shadow: 0px 0px 10px rgb(0, 0, 0);
        background-color: black;
        border-radius: 5px;
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
        top: 270px;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    #connexionboutton {
        margin-top: 25px;
        margin-bottom: 10px;
    }
    #connexionboutton:hover {
        box-shadow: 0px 0px 5px rgb(255, 0, 251), 0px 0px 6px #000000;
    }
    .textinfo {
        color: white;
        font-size: 13px;
        text-shadow: 4px 5px 6px black;
    }
    .info {
        text-align: center;
        font-size: 15px;
        color: rgb(255, 255, 255);
        text-shadow: 4px 5px 6px black;
        margin-top: 17px;
        line-height: 17px;
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
        position: absolute;
        top: 155px;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 35px;
    }
    #storymode:hover {
        color: rgb(255, 0, 251);
        box-shadow: 0px 0px 10px rgb(0, 0, 0), 0px 0px 10px #000000;
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
