package util.plateau.outils.ressource;

/**
 * Constructeur Minerais heritier de Ressource
 */
public class Minerais implements Ressource {
    /**
     * Constructeur Minerais.
     */
    public Minerais() {
    }

    /**
     * representation du ressource
     * 
     * @return String representation
     */
    @Override
    public String toString() {
        return "Minerais";
    }

    /**
     * Retourne true ou false si un autre resosource est du meme type
     * 
     * @param o l'objet a comparer
     * @return boolean result
     */
    @Override
    public boolean equals(Object o) {
        return o instanceof Minerais;
    }
}
