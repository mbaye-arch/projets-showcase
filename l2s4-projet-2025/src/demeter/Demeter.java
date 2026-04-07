package demeter;

import demeter.util.action.AcheterVoleur;
import demeter.util.action.ConstruireFerme;
import demeter.util.action.EchangerRessourceViaPort;
import demeter.util.action.JouerVoleur;
import demeter.util.action.RemplacerFermeExploitation;
import demeter.util.joueur.JoueurDemeter;
import java.util.*;
import util.action.Action;
import util.jeu.Jeu;
import util.joueur.Joueur;
/**
 * classe Demeter representant le jeu Demeter heritant Jeu 
 */
public class Demeter extends Jeu {
    Scanner sc = new Scanner(System.in);
    protected int nbVoleur;
    /**
     * constructeur jeu ares
     * 
     * @param ligne   ligne du plateau de jeu
     * @param colonne colonne du plateau de jeu
     */
    public Demeter(int ligne, int colonne) {
        super(ligne, colonne);
        this.nbVoleur= new Random().nextInt(10);
        super.getRessource().add(JoueurDemeter.VOLEUR);
        super.getActions().add(new ConstruireFerme(this));
        super.getActions().add(new RemplacerFermeExploitation(this));
        super.getActions().add(new JouerVoleur(this));
        super.getActions().add(new EchangerRessourceViaPort(this));
        super.getActions().add(new AcheterVoleur(this));
    }
    /**
     * cette methode retourne  nombre de voleur dans le jeu 
     * @return int  le nombre de voleur 
     */
    public int getNbVoleur(){
        return this.nbVoleur;
    }
    /*
     * modifie le nombre de voleur dans le jeu 
     */
    public void setNbVoleur(int n){
        this.nbVoleur=n;
    }
    /**
     * cette methode permet de diminuer le nombre de voleur lorsqu'un joueur fait 
     * un achat 
     */
    public void diminuerNbVoleur(){
        this.nbVoleur=this.nbVoleur-1;
    }

    /**
     * cette methode permet de lancer le jeu
     * 
     * @throws Exception
     */
    public void Game() throws Exception {
        this.displayDescription();
        System.out.println("Nombre de Voleur disponible = "+this.getNbVoleur());
        super.initialiseJeu();
        Joueur gagnant =this.getGagnant();
        while (gagnant == null) {
            System.out.println("Tour : " + super.nbTours + "\n");
            for (Joueur joueur : super.getJoueurs()) {
                System.out. println("Tour de " + joueur);
                joueur.display();
                super.displayBatimentJoueur(joueur);
                super.display();
                System.out.println(joueur.getName() + " Veuillez choisir une action");
                Action action = super.choisirAction(joueur);
                action.act(joueur);
            }
            super.passerPhase();
            gagnant=this.getGagnant();
            super.display();
        }
        System.out.println("🏆🏆🏆🏆🏆🏆 AND THE WIIIINNNER IS " + gagnant.getName()+" 🏆🏆🏆🏆🏆🏆");
        gagnant.display();
        System.out.println("Felicitations");
        super.getSc().close();
    }

    /**
     * cette methode permet de retourner le gagnant du jeu
     * 
     * @return le joueur gagnant
     */
    @Override
    public Joueur getGagnant() {
        for(Joueur j : super.getJoueurs()){
            if (((JoueurDemeter)j).getNbPoints() >= 12){
                return j;
            }
        }
        return null;
    }

    /**
     * Cette méthode affiche une description du jeu Demeter et ses règles
     * avant le démarrage de la partie.
     */
    public void displayDescription() {
        System.out.println(" _____________________________________________________________________________________________________");
        System.out.println("|                                                                                                     |");
        System.out.println("|   🌾 Bienvenue dans le jeu Demeter                                                                  |"); 
        System.out.println("|                                                                                                     |");
        System.out.println("|   🧠 Demeter est un jeu de stratégie dans lequel chaque joueur doit placer des fermes sur des       |");
        System.out.println("|      tuiles pour développer son territoire et accumuler des points de victoire.                    |");
        System.out.println("|                                                                                                     |");
        System.out.println("|   🔄 Le jeu se déroule en plusieurs tours, où chaque joueur joue à tour de rôle.                    |");
        System.out.println("|                                                                                                     |");
        System.out.println("|   🎯 À chaque tour, le joueur choisit une action parmi celles disponibles :                         |");
        System.out.println("|     🏠 - Construire une ferme                                                                        |");
        System.out.println("|     ⚓ - Construire un port                                                                          |");
        System.out.println("|     🕵️ - Voler un joueur                                                                             |");
        System.out.println("|     🎲 - Et bien d'autres...                                                                         |");
        System.out.println("|                                                                                                     |");
        System.out.println("|   ⚠️  Règle importante : les ports ne peuvent être construits que sur des tuiles voisines de la mer.|");
        System.out.println("|                                                                                                     |");
        System.out.println("|   🏆 Objectif : atteindre 12 points pour gagner la partie.                                          |");
        System.out.println("|   🛡️ Chaque joueur placera deux armées au début de la partie.                                       |");
        System.out.println("|                                                                                                     |");
        System.out.println("|   🍀 Bonne chance à tous les joueurs et que le meilleur stratège l’emporte !                        |");
        System.out.println(" _____________________________________________________________________________________________________");
    }


    /**
     * cette methode retourne le nombre de tour 
     * @return le nombre de tours
     */
    public int getNbTours() {
        return super.nbTours;
    }

    // /**
    //  * Calcule les pts des joueurs.
    //  */
    // public void calculerPtsJoueurs(){
    //     for (Joueur j : super.getJoueurs()) {
    //         int n = ((JoueurDemeter)j).nbPointsAjouter();
    //         ((JoueurDemeter)j).addPoints(n);
    //     }
    // }
}

