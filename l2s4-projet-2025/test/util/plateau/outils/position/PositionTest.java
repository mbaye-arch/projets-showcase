package util.plateau.outils.position;

import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Classe de test pour la classe {@link Position}.
 */
public class PositionTest {
    
    private Position pos;
    private Position position1;
    private Position position2;
    private Position validPos;
    private Position invalidPos;
    private Position positionInit;
    
    /**
     * Initialisation des objets avant chaque test.
     */
    @BeforeEach
    public void setUp() {
        pos = new Position(4, 6);
        position1 = new Position(4, 6);
        position2 = new Position(4, 6);
        validPos = new Position(1, 1);
        invalidPos = new Position(-1, -1);
        positionInit = new Position(7, 7);
    }

    /**
     * Test du constructeur et des getters.
     */
    @Test
    public void testConstructorGetters() {
        assertEquals(4, pos.getX());
        assertEquals(6, pos.getY());
    }

    /**
     * Test des setters de la classe Position.
     */
    @Test
    public void testSet() {
        pos.setX(10);
        assertEquals(10, pos.getX());
        
        pos.setY(10);
        assertEquals(10, pos.getY());
    }

    /**
     * Test de l'égalité entre les positions.
     */
    @Test
    public void testEquals() {
        assertEquals(position1, position1);  // Comparaison avec lui-même
        assertEquals(position1, position2);  // Comparaison avec une position identique
        assertNotEquals(position1, null);    // Comparaison avec null
        assertNotEquals(position1, 10);      // Comparaison avec un objet d'un autre type
    }

    /**
     * Test de la validation d'une position.
     */
    @Test
    public void testIsValide() {
        assertTrue(validPos.isValide(2, 2));  // Position valide dans les limites
        assertFalse(invalidPos.isValide(2, 2));  // Position invalide hors des limites
    }

    /**
     * Test de la méthode nextPosition().
     */
    @Test
    public void testNextPosition() {
        Position res = positionInit.nextPosition(Direction.UP);
        Position expected = new Position(6, 7); // Correction de la valeur attendue
        assertEquals(expected, res);
    }

    /**
     * Test de la méthode getPositionVoisin().
     */
    @Test
    public void testGetPositionVoisin() {
        List<Position> ListVoisin = positionInit.getPositionVoisin(10,10);
        List<Position> expected = new ArrayList<>();
        expected.add(new Position(6, 7));
        expected.add(new Position(7, 6));
        expected.add(new Position(8, 7));
        expected.add(new Position(7, 8));

        assertTrue(ListVoisin.containsAll(expected));
    }

    /**
     * Test de la méthode getCoteAlea().
     */
    @Test
    public void testGetCoteAlea() {
        Position posTest = new Position(2, 3);
        Position res = posTest.getCoteAlea(5, 5);
        List<Position> voisins = posTest.getPositionVoisin(5, 5);
        
        assertTrue(voisins.contains(res));
    }

    /**
     * Test de la méthode toString().
     */
    @Test
    public void testToString() {
        assertEquals("(4,6)", pos.toString());
    }
}
