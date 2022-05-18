import { writable } from 'svelte/store';
import { getContext, setContext } from "svelte";


export class Allier {
    constructor(pseudo, sprite, x, y) {
        this.pseudo = pseudo;
        this.sprite = sprite;
        this.x = x;
        this.y = y;
    }
}

//TODO ----------------------------------------------- Personnage -------------------------


export class Personnage {
    constructor(pseudo, cyberz, niveau) {
        this.pseudo = pseudo;
        this.cyberz = cyberz;
        this.sante = 20;
        this.attaque = 5;
        this.defense = 1;
        this.vitesse = 1;
        this.niveau = niveau;
        this.xp = 0;
        this.pass = "0000";
        this.score = [0, 0, 0, 0];
        this.kill = [0, 0, 0, 0];
        this.inventaire = [{ img: 'img/carteagent.png', nom: "Carte d'agent", prix: 0, effet: "Auncun", type: "Personnel", description: "Carte professionelle d'agent d'Onix Corp.", createur: "Onix Corp.", qualite: "Basique", materiauxonix: 0, materiauxchimique: 0 }];
        this.puce = ["", "", ""];
        this.relique = [""];
        this.amelioration = ["", "", ""];
        this.coffres = [""];
        this.classe = "";
        this.partenaire = "";
        this.skills = ["", "", "", "", "", "", ""];
        this.progression = "";
        this.skin = "";
        this.personnage = "";
        this.img = "img/inviteface.png";
        this.alignement = 0;
        this.materiauxonix = 0;
        this.materiauxchimique = 0;
        this.ventes = 0;
        this.messages = [""];
        this.gemmes = 0;
        this.mail = "";
        this.amis = ""


    }
    nivplus() {
        this.niveau += 1;
        /* console.log(this.pseudo + " passe au niveau " + this.niveau); */

        // methode de classe on ne met pas le mot function
    }
    verifiersante() {
        if (this.sante <= 0) {
            this.sante = 0;
            return this.sante;
        } else {
            return this.sante;
        }
    }
    get info() { }
    ajoutxp(xp) {
        if (xp >= 100) {
            nivplus();
        } else {
            this.xp += xp;
        }
    }
}

export class Objet {
    constructor(nom, prix, img, type, description, effet, createur, qualite, materiauxonix, materiauxchimique) {
        this.nom = nom;
        this.prix = prix;
        this.effet = effet
        this.img = img
        this.type = type
        this.description = description
        this.createur = createur
        this.qualite = qualite
        this.materiauxonix = materiauxonix;
        this.materiauxchimique = materiauxchimique

    }
}

export class Ennemi {

    constructor(nom, niveau, sante, attaque, defense, vitesse, sprite, butin) {

        this.nom = nom;
        this.niveau = niveau;
        this.sante = sante;
        this.attaque = attaque;
        this.defense = defense;
        this.vitesse = vitesse;
        this.sprite = sprite;
        this.butin = butin;


    }
}

//TODO ----------------------------------------------- Writable -------------------------
export let chatouvert = true
export let focuschat = writable(false)
export let volume = writable(1)
export let pause = writable(false)
export let directionsprite = writable("droite")
export let nbjoueursenligne = writable()
export let joueursenligne = writable([])
export let contenuchat = writable([""])
//TODO ----------------------------------------------- Etats -------------------------

export class Etats {
    constructor() {

    }

    stun(personnage) {

        personnage.vitesse = 0
        setTimeout(() => {
            personnage.vitesse = 1

        }, 2000);
    }
    ralenti(personnage) {
        personnage.vitesse = 0.5
        setTimeout(() => {
            personnage.vitesse = 1

        }, 2000);

    }


}
//TODO ----------------------------------------------- Effets Sonores -------------------------

export let effetui =
{
    fermer: new Audio("son/effet/ui/fermer2.mp3"),
    chat: new Audio("son/effet/ui/message2.mp3"),
    message: new Audio("son/effet/ui/message.mp3"),
    up: new Audio("son/effet/ui/nouveau.mp3"),
    hover: new Audio("son/effet/ui/selection4.mp3"),
    valider: new Audio("son/effet/ui/valider.mp3"),
    recompense: new Audio("son/effet/ui/coffre.mp3"),
    selection: new Audio("son/effet/ui/enclenchement.mp3"),
    notif: new Audio("son/effet/ui/info.mp3"),
    up2: new Audio("son/effet/ui/potion.mp3"),
    retroconfection: new Audio("son/effet/ui/retroconfection.mp3"),
    vendre: new Audio("son/effet/ui/vendre.mp3"),
    error: new Audio("son/effet/ui/error.mp3"),
    ventecybershop: new Audio("son/effet/ui/nouveau2.mp3"),



}
export let effetarme =
{
    tir: new Audio("son/effet/sprite/tir3.mp3"),
    tirbis: new Audio("son/effet/sprite/tir3.mp3"),
    tir2: new Audio("son/effet/sprite/tir2.mp3"),
    tir3: new Audio("son/effet/sprite/projectile2.mp3"),
    impact: new Audio("son/effet/sprite/tir2.mp3"),
    impactbis: new Audio("son/effet/sprite/tir2.mp3"),
    tirlourd: new Audio("son/effet/sprite/tirchargé.mp3"),
    rafale: new Audio("son/effet/sprite/tir5.mp3"),
    projectile: new Audio("son/effet/sprite/projectile.mp3"),
    bomb: new Audio("son/effet/sprite/bombplasma.mp3"),
    bombtoxik: new Audio("son/effet/sprite/bombtoxik.mp3")



}
export let effetambiance =
{
    acceuil: new Audio("son/effet/ambiance/ambiance.mp3"),
    complexe: new Audio("son/effet/ambiance/ambiance2.mp3")
}


export let effetsprite =
{
    pas: new Audio("son/effet/sprite/pas.mp3"),
    pasbis: new Audio("son/effet/sprite/pas.mp3")



}