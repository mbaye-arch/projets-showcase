package util.plateau.outils.ressource;

/**
 * Classe Mouton heritier de Ressource
 */
public class Mouton implements Ressource {
    /**
     * Constructeur par défaut de la classe Mouton.
     */
    public Mouton() {
    }

    /**
     * representation du ressource
     * 
     * @return String representation
     */
    @Override
    public String toString() {
        return "Mouton";
    }

    /**
     * Retourne true ou false si un autre resosource est du meme type
     * 
     * @param o l'objet a comparer
     * @return boolean result
     */
    @Override
    public boolean equals(Object o) {
        return o instanceof Mouton;
    }
}
