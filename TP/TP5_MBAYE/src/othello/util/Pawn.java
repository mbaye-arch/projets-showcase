package othello.util;

/**
 * cette classe representeras les pions qui serons placer dans le tableau
 * avec deux couleur qui seras soit bland soit NOir
 */
public class Pawn {
    private Couleur face;

    /**
     * constructeur de la classe pawn
     * 
     * @param couleur couelru du pawn
     */
    public Pawn(Couleur couleur) {
        this.face = couleur;
    }

    /**
     * cette methode retourne la couleur du pion
     * 
     * @return face du pion
     */
    public Couleur getCouleur() {
        return this.face;
    }

    /**
     * cette methode compare deux pawn et renvoie true s'ils sont de la meme couleur
     * 
     * @return boolean true or false
     */
    public boolean equals(Object o) {
        if (!(o instanceof Pawn)) {
            return false;
        } else {
            Pawn other = (Pawn) o;
            return this.face == other.face;
        }
    }

    /**
     * cette methode permet de changer la couleur d'un pion
     * si cest WHITE sa le met a BLACK et inversemment
     */
    public void reverse() {
        if (this.face == Couleur.BLACK) {
            this.face = Couleur.WHITE;
        } else {
            this.face = Couleur.BLACK;
        }
    }

    /**
     * cette methode fait une representation de la couleur B pour white et N pour
     * black
     * 
     * @return caractere
     */
    public String toString() {
        String chaine = "";
        if (this.face == Couleur.BLACK) {
            chaine = chaine + "N";
        } else {
            chaine = chaine + "B";
        }
        return chaine;
    }

    /**
     * cette methode renvoie une nouvelle pion qui est linverse du pion mise
     * en parametres
     * @return new PIon de couleur inverse
     */
    public Pawn getPionInverse() {
        if (this.face == Couleur.BLACK) {
            return new Pawn(Couleur.WHITE);
        } else {
            return new Pawn(Couleur.BLACK);
        }
    }
}
