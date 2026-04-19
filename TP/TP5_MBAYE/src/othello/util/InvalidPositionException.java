package othello.util;

/**
 * cette classe exceptions represente lexeptions qui est renvoyes
 */
public class InvalidPositionException extends Exception {
    /**
     * constructeur de lexeption
     * @param msg largument pris par lexception et renvoye
     */
    public InvalidPositionException(String msg) {
        super(msg);
    }
}
