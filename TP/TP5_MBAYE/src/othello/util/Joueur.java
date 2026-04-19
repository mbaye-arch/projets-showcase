package othello.util;

/**
 * cette classe represnete un joueur avec son nom et son couleur
 */
public class Joueur {
    private String nom;
    private Couleur couleur;

    /**
     * le constructeur avec nom joueur et couleur
     * 
     * @param nom nom joueur 
     * @param couleur couleur joueur
     */
    public Joueur(String nom, Couleur couleur) {
        this.nom = nom;
        this.couleur = couleur;
    }

    /**
     * donne le nom du joueur
     * 
     * @return nom
     */
    public String getNom() {
        return this.nom;
    }

    /**
     * cette methode donne la couleur du joueur
     * 
     * @return Couleur
     */
    public Couleur getCouleur() {
        return this.couleur;
    }

    /**
     * cette methode affiche nom joueur etla couleur de son pion
     */
    public String toString() {
        return "nom " + this.getNom() + " : " + new Pawn(this.getCouleur()).toString();
    }

    /**
     * cette methode permet la comparaison
     * 
     * @return boolean
     */
    public boolean equals(Object o) {
        if (!(o instanceof Joueur)) {
            return false;
        } else {
            Joueur other = (Joueur) o;
            return this.nom.equals(other.nom) && this.couleur == other.couleur;
        }
    }
}
