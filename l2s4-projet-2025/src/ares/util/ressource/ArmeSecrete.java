package ares.util.ressource;

import util.plateau.outils.ressource.*;

/**
 * Ressource representant une arme secrete
 */
public class ArmeSecrete implements Ressource {

    /**
     * Constructeur de l'arme secrete
     */
    public ArmeSecrete() {
    }

    /**
     * Retourne une chaine de caractere representant l'arme secrete
     *
     * @return une chaine de caractere representant l'arme secrete
     */
    public String toString() {
        return "Arme secrete";
    }

    /**
     * Retourne vrai si l'objet donne en parametre est une arme secrete
     *
     * @param o l'objet a comparer
     * @return vrai si l'objet donne en parametre est une arme secrete
     */
    @Override
    public boolean equals(Object o) {
        return o instanceof ArmeSecrete;
    }
}
