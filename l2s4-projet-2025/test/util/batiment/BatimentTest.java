package util.batiment;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Before;
import org.junit.Test;

import demeter.util.joueur.JoueurDemeter;
import util.joueur.Joueur;

/**
 * Test unitaire pour la classe Batiment.
 */
public class BatimentTest {

    private Batiment batiment1;
    private Batiment batiment2;
    private Joueur joueur1;
    private Joueur joueur2;

    /**
     * Implémentation d'une sous-classe concrète de Batiment pour les tests.
     */
    private static class BatimentConcret extends Batiment {
        public BatimentConcret(int dimension, Joueur proprio) {
            super(dimension, proprio);
        }

        @Override
        public String toString() {
            return "BatimentConcret de " + proprietaire.getName() + " avec dimension " + dimension;
        }

        @Override
        public String toStringB() {
            
            throw new UnsupportedOperationException("Unimplemented method 'toStringB'");
        }
    }

    @Before
    public void setUp() {
        joueur1 = new JoueurDemeter("Alice");
        joueur2 = new JoueurDemeter("Bob");

        batiment1 = new BatimentConcret(2, joueur1);
        batiment2 = new BatimentConcret(3, joueur2);
    }

    @Test
    public void testGetProprietaire() {
        assertEquals(joueur1, batiment1.getProprietaire());
        assertEquals(joueur2, batiment2.getProprietaire());
    }

    @Test
    public void testGetDimension() {
        assertEquals(2, batiment1.getDimension());
        assertEquals(3, batiment2.getDimension());
    }

    @Test
    public void testSetDimension() {
        batiment1.setDimension(5);
        assertEquals(5, batiment1.getDimension());
    }

    @Test
    public void testAddDimension() {
        batiment1.addDimension(3);
        assertEquals(5, batiment1.getDimension());
    }

    @Test
    public void testEquals() {
        Batiment sameAsBatiment1 = new BatimentConcret(2, joueur1);
        assertTrue(batiment1.equals(sameAsBatiment1));
        assertFalse(batiment1.equals(batiment2));
    }

    @Test
    public void testToString() {
        assertEquals("BatimentConcret de Alice avec dimension 2", batiment1.toString());
        assertEquals("BatimentConcret de Bob avec dimension 3", batiment2.toString());
    }
}
