package ares;

import java.util.Random;

import ares.util.action.*;
import ares.util.joueur.JoueurAres;
import ares.util.joueur.objectif.ConquerTuile;
import ares.util.joueur.objectif.EnvIle;
import ares.util.joueur.objectif.NbGuerrierObjectif;
import util.action.*;
import util.batiment.NoValidTuilePlacementException;
import util.jeu.Jeu;
import util.joueur.Joueur;
import util.joueur.objectif.Objectif;

/**
 * classe Ares representant le jeu Ares heritant Jeu
 */
public class Ares extends Jeu {
    /**
     * constructeur jeu ares
     *
     * @param ligne   ligne du plateau de jeu
     * @param colonne colonne du plateau de jeu
     */
    public Ares(int ligne, int colonne) {
        super(ligne, colonne);
        // ajout des ressources specifique au jeu Ares
        super.getRessource().add(JoueurAres.GUERRIER);
        super.getRessource().add(JoueurAres.ARME_SECRETE);
        super.addActions(new EchangeRessource(this));
        super.addActions(new AcheterArmeSecrete(this)); // Correction nom classe
        super.addActions(new AjouterGuerrier(this));
        super.addActions(new AjouterGuerrierStock(this));
        super.addActions(new AttaquerUnAutreJoueur(this));
        super.addActions(new ConstruireArmée(this));
        super.addActions(new RemplacerArmeCamp(this));
    }

    /**
     * cette classe gere le paratge des obejtcifs au joueur
     * il choisis des obejtcifs de maniere aleatoire ainsi
     * haque joueur peut avoir des objectifs diferrents
     */
    public void genereObjectifsJoueur() {
        Random n = new Random();
        for (Joueur joueur : super.getJoueurs()) {
            int choix = 1 + n.nextInt(3);
            switch (choix) {
                case 1:
                    ((JoueurAres) joueur).setObjectif(new NbGuerrierObjectif(this, joueur, n.nextInt(45) + 25));
                    break;
                case 2:
                    ((JoueurAres) joueur).setObjectif(new EnvIle((Jeu) this, (JoueurAres) joueur));
                    break;
                case 3:
                    int nbTuile = (super.getLIgne() * getColonne()) / 3;
                    ((JoueurAres) joueur).setObjectif(
                            new ConquerTuile((Jeu) this, n.nextInt(nbTuile / 3) + 10, (JoueurAres) joueur));
                    break;
                default:
                    break;
            }
        }
    }

    public void displayObjectifsJoueur() {
        System.out.println();
        System.out.println("_______________________________________________________________________");
        for (Joueur joueur : super.getJoueurs()) {
            System.out.println(joueur.getName() + " " + ((JoueurAres) joueur).getObjectif());
        }
        System.out.println("_______________________________________________________________________");
    }

    /**
     * cette methode permet de lancer le jeu
     *
     * @throws NoValidTuilePlacementException
     */
    public void Game() throws Exception {
        this.displayDescription();
        this.genereObjectifsJoueur();
        this.displayObjectifsJoueur();
        this.initialiseJeu();
        Joueur gagnant = null;
        while ((gagnant = this.getGagnant()) == null) {
            System.out.println();
            System.out.println("Tour : " + super.nbTours + "\n");
            for (Joueur joueur : super.getJoueurs()) {
                System.out.println("Tour de " + joueur);
                ((JoueurAres) joueur).getObjectif().objRestant();
                super.display();
                joueur.display();
                super.displayBatimentJoueur(joueur);
                Action action = super.choisirAction(joueur);
                action.act(joueur);
                joueur.display();
                System.out.println();
            }
            super.passerPhase();
            super.display();
        }
        super.display();
        System.out.println("🏆🏆🏆🏆🏆🏆 AND THE WIIIINNNER IS " + gagnant.getName() + " 🏆🏆🏆🏆🏆🏆");
        gagnant.display();
        ((JoueurAres) gagnant).getObjectif().objAtteint();
        super.getSc().close();
        super.getActions().get(0).getSc().close();
    }

    /**
     * cette methode permet de recuperer le gagnant du jeu
     * 
     * @return le joueur gagnant
     * 
     */
    @Override
    public Joueur getGagnant() {
        for (Joueur joueur : super.getJoueurs()) {
            Objectif objetc = ((JoueurAres) joueur).getObjectif();
            if (objetc.aAtteintObjectif()) {
                return joueur;
            }
        }
        return null;
    }

    /**
     * cette methode permet de recuperer le nombre de tours
     *
     * @return le nombre de tours
     */
    public int getNbTours() {
        return super.nbTours;
    }

    /**
     * Cette méthode affiche une introduction et les règles du jeu Ares
     * avant le démarrage de la partie.
     */
    public void displayDescription() {
        System.out.println(" ____________________________________________________________________________________________________");
        System.out.println("|                                                                                                    |");
        System.out.println("|   ⚔️  Bienvenue dans le monde d'Ares - le jeu de stratégie et de conquête !                         |");
        System.out.println("|   Dans Ares, chaque joueur incarne un chef de guerre prêt à étendre son territoire.                |");
        System.out.println("|   Vous devrez gérer vos armées, bâtir des camps, capturer des ressources et vaincre vos ennemis.   |");
        System.out.println("|                                                                                                    |");
        System.out.println("|   Le jeu se déroule en plusieurs tours. À chaque tour, vous pouvez :                               |");
        System.out.println("|     - Attaquer un autre joueur                                                                     |");
        System.out.println("|     - Construire une armée ou un camp                                                              |");
        System.out.println("|     - Récolter des ressources                                                                      |");
        System.out.println("|     - Utiliser des armes secrètes                                                                  |");
        System.out.println("|                                                                                                    |");
        System.out.println("|   ⚠ Règles importantes :                                                                           |");
        System.out.println("|     - Les armées doivent être placées sur des tuiles valides.                                      |");
        System.out.println("|     - Les attaques nécessitent au moins une armée ou un camp actif.                                |");
        System.out.println("|     - Les dés déterminent l'issue des combats.                                                     |");
        System.out.println("|                                                                                                    |");
        System.out.println("|   🎯 Objectif : Chaque joueur a un objectif généré aléatoirement en début de partie.               |");
        System.out.println("|   🏆 Serez-vous le stratège ultime qui mènera son peuple à la victoire ?                           |");
        System.out.println("|                                                                                                    |");
        System.out.println("|   Chaque joueur placera deux armées au début de la partie.                                         |");
        System.out.println("|   Que la bataille commence...                                                                      |");
        System.out.println(" ____________________________________________________________________________________________________");
    }
    
}    