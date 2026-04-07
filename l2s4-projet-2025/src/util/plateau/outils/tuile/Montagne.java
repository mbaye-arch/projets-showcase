package util.plateau.outils.tuile;

import util.plateau.outils.position.*;
import util.plateau.outils.ressource.*;

/**
 * Class Montagne heritier de Tuile
 */
public class Montagne extends Tuile {
    private final Ressource res = new Minerais();
    private Ressource ressource;

    /**
     * Constructeur Montagne
     * 
     * @param position position de la tuile
     */
    public Montagne(Position position) {
        super(position);
        this.ressource = res;
    }

    /**
     * Renvoie la ressource associe a la tuile
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
        return "M_";
    }

    /**
     * Retourne vraie ou faux si tuile egale
     * 
     * @return boolean result
     */
    @Override
    public boolean equals(Object o) {
        if (super.equals(o)) {
            return this.getRessource().equals(((Montagne) o).getRessource());
        }
        return false;
    }

}
