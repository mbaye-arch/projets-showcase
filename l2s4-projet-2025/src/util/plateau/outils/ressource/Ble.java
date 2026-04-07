package util.plateau.outils.ressource;

/**
 * Classe Ble heritier de Ressource
 */
public class Ble implements Ressource {
    /**
     * Constructeur Ble.
     */
    public Ble() {
    }

    /**
     * representation du ressource
     * 
     * @return String representation
     */
    @Override
    public String toString() {
        return "Ble";
    }

    /**
     * Retourne true ou false si un autre ressource est du meme type
     * 
     * @param o l'objet a comparer
     * @return boolean result
     */
    @Override
    public boolean equals(Object o) {
        return o instanceof Ble;
    }
}
