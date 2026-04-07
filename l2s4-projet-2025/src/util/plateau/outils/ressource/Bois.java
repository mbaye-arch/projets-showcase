package util.plateau.outils.ressource;

/**
 * Classe Bois heritier de Ressource
 */
public class Bois implements Ressource {
    /**
     * Constructeur Bois.
     */
    public Bois() {
    }

    /**
     * representation du ressource
     * 
     * @return String representation
     */
    @Override
    public String toString() {
        return "Bois";
    }

    /**
     * cette methode renvoie true ou false si un autre resosource est du meme type
     * 
     * @param o l'objet a comparer
     * @return boolean result
     */
    @Override
    public boolean equals(Object o) {
        return o instanceof Bois;
    }
}
