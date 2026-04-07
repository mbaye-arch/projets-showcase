package util.plateau.outils.tuile;

import util.plateau.outils.position.*;
import util.plateau.outils.ressource.*;

/**
 * Class Champs heritier de Tuile
 */
public class Champs extends Tuile {
    private final Ressource res = new Ble();
    private Ressource ressource;

    /**
     * constructeur de Champs
     * 
     * @param position position de la tule
     */
    public Champs(Position position) {
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
        return "C_";
    }

    /**
     * Retourne vraie ou faux si tuile egale
     * 
     * @return boolean result
     */
    @Override
    public boolean equals(Object o) {
        if (super.equals(o)) {
            return this.getRessource().equals(((Champs) o).getRessource());
        }
        return false;
    }
}
