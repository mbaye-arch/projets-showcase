package demeter.util.action;

import demeter.Demeter;
import demeter.util.joueur.JoueurDemeter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import util.jeu.Jeu;
import util.joueur.Joueur;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import static org.junit.jupiter.api.Assertions.*;

public class AcheterVoleurTest {
    private AcheterVoleur action;
    private JoueurDemeter joueur;
    private Jeu jeu;
    private final ByteArrayOutputStream outContent = new ByteArrayOutputStream();

    @BeforeEach
    public void setUp() {
        System.setOut(new PrintStream(outContent));
        joueur = new JoueurDemeter("Alice");
        jeu = new Demeter(10,10);
        ((Demeter) jeu).setNbVoleur(2);
        action = new AcheterVoleur(jeu);
    }

    @Test
    public void testEquals() {
        AcheterVoleur sameAction = new AcheterVoleur(jeu);
        assertEquals(action, sameAction);

        Object differentObject = new Object();
        assertNotEquals(action, differentObject);
    }

    @Test
    public void testActWithSufficientResources() throws Exception {
        joueur.addRessource(Joueur.MINERAIS, 1);
        joueur.addRessource(Joueur.BOIS, 1);
        joueur.addRessource(Joueur.BLE, 1);
        action.act(joueur);
        // ils ont deja un voleur de depart donc sil en achete un autre il aura 2 voleurs
        assertEquals(2, joueur.getRessources().get(JoueurDemeter.VOLEUR));
        assertEquals(0, joueur.getRessources().get(Joueur.MINERAIS));
        assertEquals(0, joueur.getRessources().get(Joueur.BOIS));
        assertEquals(0, joueur.getRessources().get(Joueur.BLE));
        assertTrue(outContent.toString().contains("Action effectuée avec succès"));
    }

    @Test
    public void testActWithInsufficientResources() throws Exception {
        action.act(joueur);
        assertEquals(1, joueur.getRessources().get(JoueurDemeter.VOLEUR));
    }

    @Test
    public void testToString() {
        assertTrue(action.toString().contains("Acheter un voleur"));
    }
}