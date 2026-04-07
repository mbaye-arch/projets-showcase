package util.batiment;

import util.joueur.Joueur;

/**
 * Port est une classe qui herite de Batiment
 */
public class Port extends Batiment {
    /**
     * constructeur de la classe Port
     * 
     * @param dimension la dimension du batiment
     */
    public Port(Joueur proprio) {
        // la dimension de la port 2
        super(2, proprio);
    }

    /**
     * methode abstraite equals qui permet de comparer deux batiments
     * 
     * @param o l'objet a comparer
     * @return boolean true si les deux batiments sont egaux, false sinon
     */
    public boolean equals(Object o) {
        return super.equals(o) && o instanceof Port;
    }

    /**
     * affiche le batiment sous forme de chaine de caractere
     * 
     * @return String
     */
    public String toString() {
        return super.getProprietaire().toString() + " --> Port";
    }

    public String toStringB(){
        return "P_";
    }
}