package othello.util;

/**
 * cette class est la classe postion qui permettra de
 * representer les positions des pions dans le tableau
 */
public class Position {
    private int x;
    private int y;

    /***
     * constructeur du position avec son c et son y
     * 
     * @param x coordonne sur les lignes
     * @param y coordonne y sur les colonnes
     */
    public Position(int x, int y) {
        this.x = x;
        this.y = y;
    }

    /**
     * cette methode retourne le coordonne x de la position
     * 
     * @return int valeur de x
     */
    public int getX() {
        return this.x;
    }

    /**
     * cette methode retourne le coordonne y de la position
     * 
     * @return int int valeur de y
     */
    public int getY() {
        return this.y;
    }

    /**
     * cette methode compare deux positions
     * 
     * @return true si les deux position sont egales de par leur x et leur y
     */
    public boolean equals(Object o) {
        if (!(o instanceof Position)) {
            return false;
        } else {
            Position other = (Position) o;
            return (this.x == other.x) && (this.y == other.y);
        }
    }

    /**
     * cette methode fait la representation des position sous formes de tuple(x,y)
     */
    public String toString() {
        return "( " + this.x + " , " + this.y + " )";
    }

    /**
     * cette methode permet de dire si une position est valide dans une tableau de
     * 8x8
     * 
     * @return boolean true ou false selon la validite de la position
     */
    public boolean estPositionValide() {
        return (this.getX() >= 0 && this.getX() <= 7) && (this.getY() >= 0 && this.getY() <= 7);
    }

    /**
     * cette methode donne la diferrence entere deux positions proche sa veut dire
     * la direction
     * 
     * @param other position
     * @return new position correxspindant a la direction
     */
    public Position getDirection(Position other) {
        return new Position(this.x - other.getX(), this.y - other.getY());
    }

    /**
     * cette methode dit si deux positions sont cote a cote
     * 
     * @param other lautre position pour la comparaison
     * @return boolean false ou true
     */
    public boolean SontCoteACot(Position other) {
        Position res = this.getDirection(other);
        for (Direction direction : Direction.values()) {
            if (direction.getDx() == res.getX() && direction.getDy() == res.getY()) {
                return true;
            }

        }
        return false;
    }
    /**
     * cette  methode retourne la position qui suit 
     * @param direction direction a laquelle voir 
     * @return position quon veut
     */
    public Position getPositionDirection(Position direction) {
        return new Position(this.x + direction.getX(), this.y + direction.getY());
    }
}