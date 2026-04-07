package util.joueur;

import static org.junit.Assert.*;
import org.junit.Before;
import org.junit.Test;
import util.plateau.outils.ressource.Ressource;

import java.util.Map;

/**
 * Test de la classe abstraite Joueur
 */
public class JoueurTest {

    private Joueur joueur;

    // Sous-classe concrète de Joueur pour le test
    private class JoueurTestImpl extends Joueur {
        public JoueurTestImpl(String name) {
            super(name);
        }
    }

    @Before
    public void setUp() {
        joueur = new JoueurTestImpl("Alice");
    }

    @Test
    public void testCreationJoueur() {
        assertNotNull(joueur);
        assertEquals("Alice", joueur.getName());
        // Vérifie que toutes les ressources sont bien initialisées à 0
        for (Ressource res : joueur.getRessources().keySet()) {
            assertEquals(Integer.valueOf(0), joueur.getRessources().get(res));
        }
    }

    @Test
    public void testAjoutRessource() {
        joueur.addRessource(Joueur.BOIS, 5);
        joueur.addRessource(Joueur.MOUTON, 3);

        Map<Ressource, Integer> ressources = joueur.getRessources();
        assertEquals(Integer.valueOf(5), ressources.get(Joueur.BOIS));
        assertEquals(Integer.valueOf(3), ressources.get(Joueur.MOUTON));
    }

    @Test
    public void testRetraitRessource() {
        joueur.addRessource(Joueur.BLE, 10);
        joueur.removeRessource(Joueur.BLE, 4);

        assertEquals(Integer.valueOf(6), joueur.getRessources().get(Joueur.BLE));
    }

    @Test
    public void testEquals() {
        Joueur autreJoueur = new JoueurTestImpl("Alice");
        assertTrue(joueur.equals(autreJoueur));

        Joueur joueurDifferent = new JoueurTestImpl("Bob");
        assertFalse(joueur.equals(joueurDifferent));
    }

    @Test
    public void testToString() {
        assertEquals("Alice", joueur.toString());
    }
}