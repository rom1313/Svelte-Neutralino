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

//TODO ----------------------------------------------- Scenes -------------------------
export let chatouvert = true
export let focuschat = writable()
export let volume = writable(1)
export let pause = writable(false)
//TODO ----------------------------------------------- Scenes -------------------------
export class Etats {
    constructor() {

    }

    stun(personnage) {
        console.log("le personnage est stun !");
        personnage.vitesse = 0
        setTimeout(() => {
            personnage.vitesse = 1
            console.log("le personnage n'est plus stun!");
        }, 2000);
    }


}