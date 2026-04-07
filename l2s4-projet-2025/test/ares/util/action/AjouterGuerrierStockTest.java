package ares.util.action;

import ares.Ares;
import ares.util.joueur.JoueurAres;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import util.joueur.Joueur;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import static org.junit.jupiter.api.Assertions.*;

public class AjouterGuerrierStockTest {
    private AjouterGuerrierStock action;
    private JoueurAres joueur;
    private Ares jeu;
    private final ByteArrayOutputStream outContent = new ByteArrayOutputStream();

    @BeforeEach
    public void setUp() {
        System.setOut(new PrintStream(outContent));
        jeu = new Ares(10, 10);
        joueur = new JoueurAres("Alice");
        action = new AjouterGuerrierStock(jeu);
        jeu.ajouterJoueur(joueur);
    }

    @Test
    public void testEquals() {
        AjouterGuerrierStock sameAction = new AjouterGuerrierStock(jeu);
        assertEquals(action, sameAction);

        Object differentObject = new Object();
        assertNotEquals(action, differentObject);
    }

    @Test
    public void testActWithSufficientResources() throws Exception {
        joueur.addRessource(Joueur.MOUTON, 2);
        joueur.addRessource(Joueur.MINERAIS, 1);
        joueur.addRessource(Joueur.BLE, 2);
        action.act(joueur);
        // ils ont deja 30 guerriers de depart donc sil en ajoute 5 il aura 35 guerriers
        assertEquals(35, joueur.getRessources().get(JoueurAres.GUERRIER));
        assertEquals(0, joueur.getRessources().get(Joueur.MOUTON));
        assertEquals(0, joueur.getRessources().get(Joueur.MINERAIS));
        assertEquals(0, joueur.getRessources().get(Joueur.BLE));
        assertTrue(outContent.toString().contains("Action effectuée avec succès"));
    }

    @Test
    public void testActWithInsufficientResources() throws Exception {
        action.act(joueur);
        // ils ont deja 30 laction ne sest pas effectuee donc il aura toujours 30 guerriers
        assertEquals(30, joueur.getRessources().get(JoueurAres.GUERRIER));
        assertTrue(outContent.toString().contains("Ressource Insuffisante pour effectuer l'action"));
    }

    @Test
    public void testToString() {
        String expected = "Ajouter 5 guerrier au stock";
        assertTrue(action.toString().contains(expected));
    }
}