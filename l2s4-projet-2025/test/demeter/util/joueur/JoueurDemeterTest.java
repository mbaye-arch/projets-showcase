package demeter.util.joueur;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import util.batiment.Batiment;
import util.batiment.Port;

import static org.junit.jupiter.api.Assertions.*;

public class JoueurDemeterTest {
    private JoueurDemeter joueur;

    @BeforeEach
    public void setUp() {
        joueur = new JoueurDemeter("Alice");
    }

    @Test
    public void testCreationJoueurDemeter() {
        assertNotNull(joueur);
        assertEquals("Alice", joueur.getName());
        assertEquals(1, joueur.getRessources().get(JoueurDemeter.VOLEUR));
        assertEquals(0, joueur.getNbPoints());
    }

    @Test
    public void testGetStockVoleur() {
        assertEquals(1, joueur.getStockVoleur());
    }

    @Test
    public void testGetNbPoints() {
        assertEquals(0, joueur.getNbPoints());
    }

    @Test
    public void testSetNbPoints() {
        joueur.setNbPoints(5);
        assertEquals(5, joueur.getNbPoints());
        joueur.setNbPoints(3);
        assertEquals(8, joueur.getNbPoints());
    }

    @Test
    public void testDisplay() {
        joueur.setNbPoints(10);
        joueur.display();
        // Vérifiez la sortie console si nécessaire
    }

    @Test
    public void testAUnPort() {
        assertFalse(joueur.aUnPort());

        Batiment port = new Port(joueur);
        joueur.getBatiments().add(port);

        assertTrue(joueur.aUnPort());
    }

    @Test
    public void testEquals() {
        JoueurDemeter autreJoueur = new JoueurDemeter("Alice");
        assertTrue(joueur.equals(autreJoueur));

        JoueurDemeter joueurDifferent = new JoueurDemeter("Bob");
        assertFalse(joueur.equals(joueurDifferent));
    }

    @Test
    public void testToString() {
        assertEquals("Alice", joueur.toString());
    }
}