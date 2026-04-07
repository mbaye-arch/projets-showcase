package util.plateau.outils.tuile;

import util.plateau.outils.position.Position;
import util.plateau.outils.ressource.*;

/**
 * Class Paturage heritier de Tuile
 */
public class Paturage extends Tuile {
    private final Ressource res = new Mouton();
    private Ressource ressource;

    /**
     * Constructeur Paturage
     * 
     * @param position position du tuile champs
     */
    public Paturage(Position position) {
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
        return "P_";
    }

    /**
     * Retourne vraie ou faux si tuile egale
     * 
     * @return boolean result
     */
    public boolean equals(Object o) {
        if (super.equals(o)) {
            return this.getRessource().equals(((Paturage) o).getRessource());
        }
        return false;
    }
}