package util.plateau.outils.ressource;

/**
 * Classe mere des ressource
 */
public interface Ressource {
    /**
     * methode abstraite d'affichage des ressources
     * 
     * @return String representation
     */
    @Override
    public String toString();

    /**
     * cette methode retourne l'egalite entre deux ressource
     * 
     * @param o l'objet a comparer
     * @return boolean result
     */
    @Override
    public boolean equals(Object o);
}
