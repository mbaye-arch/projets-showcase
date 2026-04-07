package util.batiment;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Before;
import org.junit.Test;

import demeter.util.joueur.JoueurDemeter;
import util.joueur.Joueur;

/**
 * Test unitaire pour la classe Port.
 */
public class PortTest {

    private Port port1;
    private Port port2;
    private Joueur joueur1;
    private Joueur joueur2;

    @Before
    public void setUp() {
        joueur1 = new JoueurDemeter("Alice");
        joueur2 = new JoueurDemeter("Bob");

        port1 = new Port(joueur1);
        port2 = new Port(joueur2);
    }

    @Test
    public void testProprietaire() {
        assertEquals(joueur1, port1.getProprietaire());
        assertEquals(joueur2, port2.getProprietaire());
    }

    @Test
    public void testEquals() {
        Port anotherPort = new Port(joueur1);
        assertTrue(port1.equals(anotherPort)); // Même propriétaire
        assertFalse(port1.equals(port2)); // Différents propriétaires
    }

    @Test
    public void testToString() {
        assertEquals("Alice --> Port", port1.toString());
        assertEquals("Bob --> Port", port2.toString());
    }

    @Test
    public void testDimension() {
        assertEquals(2, port1.getDimension());
        assertEquals(2, port2.getDimension());
    }
}
