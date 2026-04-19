package othello.util;

/**
 * cette classe represente des tuple de positions
 * avecposition1 la premiere et position2 la deuxieme
 */
public class TuplePosition {
    private Position position1;
    private Position position2;

    /**
     * constructeur du tuple position avec position1 et position2
     * 
     * @param position1 la premiere position
     * @param position2 la deuxieme position
     */
    public TuplePosition(Position position1, Position position2) {
        this.position1 = position1;
        this.position2 = position2;
    }

    /**
     * donne la position 1
     * 
     * @return position1
     */
    public Position getPosition1() {
        return this.position1;
    }

    /**
     * donne la position2
     * 
     * @return position2
     */
    public Position getPosition2() {
        return this.position2;
    }

    /**
     * representation des tuples positions
     * 
     * @return String
     */
    public String toString() {
        return "( " + this.position1.toString() + " , " + this.position2.toString() + " )";
    }

    /**
     * methode pour comparer tuples positions
     * 
     * @return boolean
     */
    public boolean equals(Object o) {
        if (!(o instanceof TuplePosition)) {
            return false;
        } else {
            TuplePosition other = (TuplePosition) o;
            return this.position1.equals(other.position1) && (this.position2.equals(other.position2));
        }
    }
    

}
