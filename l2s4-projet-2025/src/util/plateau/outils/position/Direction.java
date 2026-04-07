package util.plateau.outils.position;
/**
 * L'énumération Direction représente les quatre directions cardinales 
 * (Haut, Bas, Gauche, Droite) avec leurs coordonnées correspondantes
 */
public enum Direction {
    
    /**
     * Direction vers le haut (déplacement sur l'axe Y négatif).
     */
    UP(-1, 0),

    /**
     * Direction vers la gauche (déplacement sur l'axe X négatif).
     */
    LEFT(0, -1),

    /**
     * Direction vers le bas (déplacement sur l'axe Y positif).
     */
    DOWN(1, 0),

    /**
     * Direction vers la droite (déplacement sur l'axe X positif).
     */
    RIGHT(0, 1);

    private final int x;
    private final int y;

    /**
     * Constructeur de l'énumération Direction.
     *
     * @param x La valeur de déplacement sur l'axe X.
     * @param y La valeur de déplacement sur l'axe Y.
     */
    Direction(int x, int y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Retourne la valeur X de la direction.
     *
     * @return La valeur de déplacement sur l'axe X.
     */
    public int getX() {
        return x;
    }

    /**
     * Retourne la valeur Y de la direction.
     *
     * @return La valeur de déplacement sur l'axe Y.
     */
    public int getY() {
        return y;
    }

    /**
     * Retourne une représentation sous forme de chaîne de caractères 
     * de la direction avec ses coordonnées.
     *
     * @return Une chaîne de type "DIRECTION (X, Y)".
     */
    @Override
    public String toString() {
        return name() + " (" + x + ", " + y + ")";
    }
}
