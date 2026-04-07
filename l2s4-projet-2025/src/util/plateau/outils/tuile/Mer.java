package util.plateau.outils.tuile;

import util.plateau.outils.position.*;
import util.plateau.outils.ressource.Ressource;

/**
 * Class Mer herite de Tuile
 */
public class Mer extends Tuile{
    /**
     * Constructeur Mer sans Ressource
     * @param position position de la tuile
     */
    public Mer(Position position){
        super(position);        
    }
    /**
     * cette methode fait un affichage de la tuile Mer
     */
    @Override
    public String toString() {
        return "~~~~~~";
    }
    /**
     * cette methode herite de la classe abstarite fait un surcharge  
     * de ce derniere en mettant le nombre de ressource de la mer a 0;
     * 
     */
    @Override
    public void prodRessource(){
        super.nbRes=0;
    }
    /**
     * Retourne vraie ou faux si tuile egale
     * @return boolean result
     */
    @Override
    public boolean equals(Object o) {
        if(super.equals(o)){
            return o instanceof Mer;
        }
        return false;
    }

    public Ressource getRessource(){
        return null;
    }
}