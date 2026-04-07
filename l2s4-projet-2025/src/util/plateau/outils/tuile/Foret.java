package util.plateau.outils.tuile;

import util.plateau.outils.position.*;
import util.plateau.outils.ressource.*;

/**
 * Class Foret heritier de Tuile
 */
public class Foret extends Tuile {
    private final Ressource res = new Bois();
    private Ressource ressource;

    /**
     * Constructeur Foret
     * 
     * @param position position de la tuile
     */
    public Foret(Position position) {
        super(position);
        this.ressource = res;
    }

    /**
     * Renvoie la ressource associée à la tuile.
     * 
     * @return Ressource la ressource
     */
    public Ressource getRessource() {
        return this.ressource;
    }

    /**
     * Representation de la Tuile
     * 
     * @return string chaine
     */
    @Override
    public String toString() {
        return "F_";
    }

    /**
     * Retourne vraie ou faux si tuile egale
     * 
     * @return boolean result
     */
    @Override
    public boolean equals(Object o) {
        if (super.equals(o)) {
            return this.getRessource().equals(((Foret) o).getRessource());
        }
        return false;
    }

}
