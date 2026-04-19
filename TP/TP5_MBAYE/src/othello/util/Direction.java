package othello.util;

/**
 * cette classe represente les directions
 */
public enum Direction {
    /**
     * haut gauche  
     */
    HAUT_GAUCHE(-1, -1),
    /**
     * haut
     */
    HAUT(-1, 0),
    /**
    * hautdroit 
    */
    HAUT_DROIT(-1, 1),
    /**
    * droit 
    */
    DROIT(0, 1),
    /**
     * gauche 
     */
    GAUCHE(0, -1),
    /**
     * basgauche 
     */
    BAS_GAUCHE(1, -1),
    /**
     * bas 
     */
    BAS(1, 0),
    /**
    * basdroit 
    */
    BAS_DROIT(1, 1);

    private final int dx;
    private final int dy;

    /**
     * constructeur representant direction
     * 
     * @param dx
     * @param dy
     */
    Direction(int dx, int dy) {
        this.dx = dx;
        this.dy = dy;
    }

    /**
     * donne le x de la position de la position
     * 
     * @return dx
     */
    public int getDx() {
        return dx;
    }

    /**
     * donne le y de la position
     * 
     * @return dy
     */
    public int getDy() {
        return dy;
    }

    /**
     * cette methode donne la position qui suit selon la direction
     * 
     * @param currentPosition direction a utiliser 
     * @return new position nouvelle position donne 
     */
    public Position PositionSuivantDirection(Position currentPosition) {
        return new Position(currentPosition.getX() + dx, currentPosition.getY() + dy);
    }
}
