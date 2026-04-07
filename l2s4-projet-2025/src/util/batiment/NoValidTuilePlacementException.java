package util.batiment;

/**
 * cette classe represente une exception qui est levee lorsqu'un tuile ne peut
 * pas etre placee
 */
public class NoValidTuilePlacementException extends Exception {
    public NoValidTuilePlacementException(String msg) {
        super(msg);
    }

}
