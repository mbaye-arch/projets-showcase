package util.action;

import java.util.Scanner;
import util.joueur.Joueur;

public class NeRienFaire extends Action {

    Scanner sc = new Scanner(System.in);
    /**
     * constructeur de la classe
     * @param jeu le jeu dans lequel l'action est effectuee peut etre Ares ou Demeter
     * @param prerequis cette action n'a pas de prerequis
     */
    public NeRienFaire() {
        super(null, null);
    }

     /**
     * cette methode permet de ne rien faire pour le joueur en parametre
     * 
     * @param joueur le joueur qui ne fait rien
     */
    @Override
    public void act(Joueur joueur) throws Exception {
        super.displayActionEffectue();
    }

    /**
     * cette methode permet de retourner une chaine de caractere representant
     * l'action et son prerequis
     * 
     * @return String une chaine de caractere representant l'action
     */
    @Override
    public String toString() {
        return "Ne Rien Faire (tes ressources vont augmenter)";
    }
}
