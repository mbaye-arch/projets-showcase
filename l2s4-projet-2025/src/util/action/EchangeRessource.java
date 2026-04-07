package util.action;

import java.util.HashMap;

import util.jeu.Jeu;
import util.joueur.Joueur;
import util.plateau.outils.ressource.*;

/**
 * cette classe represente l'action d'echange de ressources
 */
public class EchangeRessource extends Echanger {
    /**
     * constructeur de la classe
     * 
     * @param jeu       le jeu dans lequel l'action est effectuee peut etre Ares ou
     *                  Demeter
     * @param prerequis cette action n'a pas de prerequis
     */
    public EchangeRessource(Jeu jeu) {
        super(jeu, new HashMap<>());
    }

    /**
     * cette methode permet de verifier si l'action est egale a un objet donne
     * 
     * @param o l'objet a comparer
     * @return boolean true si l'action est egale a l'objet donne, false sinon
     */
    public boolean equals(Object o) {
        return o instanceof EchangeRessource;
    }

    /**
     * cette methode permet d'effectuer l'action
     * 
     * @param joueur     le joueur qui effectue l'action
     * @param ressources la liste des ressources a passer en parametre pour
     *                   effectuer l'action
     */
    @Override
    public void act(Joueur joueur) {
        System.out.println("Echange de ressources");
        System.out.print("Quelle ressource voulez-vous échanger ?");
        Ressource res1 = super.choixRessourceEchange();
        Ressource res2 = super.choixRessourceAEchanger(res1);
        super.getPrerequis().put(res1, 3);
        if(super.aPrerequis(joueur)){
            super.act(joueur, res1, res2, 3, 1);
            super.getPrerequis().remove(res1);
            super.displayActionEffectue();
        }
        else{
            super.getPrerequis().remove(res1);
            super.displayNoRessource();
        }
    }

    /**
     * cette methode permet de retourner le jeu dans lequel l'action est effectuee
     * 
     * @return Jeu le jeu dans lequel l'action est effectuee
     */
    @Override
    public String toString() {
        return "Echange de ressources 3 Ressources contre 1";
    }
}
