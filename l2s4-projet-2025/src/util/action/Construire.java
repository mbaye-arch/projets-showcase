package util.action;

import java.util.HashMap;

import util.batiment.Batiment;
import util.jeu.Jeu;
import util.joueur.Joueur;
import util.plateau.outils.position.Position;
import util.plateau.outils.ressource.Ressource;

public class Construire extends Action {
    /**
     * contructeur
     * 
     * @param prerequis
     * @param jeu
     */
    public Construire(HashMap<Ressource, Integer> prerequis, Jeu jeu) {
        super(prerequis, jeu);
    }

    /**
     * 
     * @param joueur
     * @param position
     * @param bat
     * @throws Exception
     */
    public boolean act(Joueur joueur, Position position, Batiment bat) throws Exception {
        boolean result = false;
        result = super.getJeu().construire(position, joueur, bat);
        return result;
    }

    @Override
    public String toString() {
        return "Construire";
    }

    @Override
    public void act(Joueur joueur) throws Exception {
        System.out.println("Construire sans surchage");
        ;
    }

    public void regleArméePort() {
        System.out.println(
                "Vous ne pouvez pas contruire de batiment dans une ile que vous n'occupez pas sans repect des condition suivant : ");
        System.out.println("1. Occupez au moins une ile");
        System.out.println("2. Avoir au moins un port sur une ile que vous occuppez deja");
        System.out.println("3. Avoir au moins deux batiments dans chacune des iles que vous occupée");
        System.out.println("Action non effectué");
        return;
    }
}
