package ares.util.action;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import ares.Ares;
import ares.util.joueur.JoueurAres;
import util.action.Action;
import util.jeu.Jeu;
import util.joueur.Joueur;

public class AcheterArmeScreteTest {

    private Jeu jeu;
    private JoueurAres joueur;
    private Action action;

    @BeforeEach
    public void setUp() {
        jeu = new Ares(10, 10);
        joueur = new JoueurAres("TestPlayer");
        action = (Action) new AcheterArmeSecrete((Ares) jeu);
        jeu.addActions(action);
    }

    @Test
    public void testEquals() {
        AcheterArmeSecrete sameAction = new AcheterArmeSecrete((Ares) jeu);
        assertEquals(action, sameAction); // même type
        assertNotEquals(action, new Object()); // objet différent
        assertNotEquals(action, null); // null
    }

    @Test
    public void testActSuccess() throws Exception {
        joueur.addRessource(Joueur.MINERAIS, 1);
        joueur.addRessource(Joueur.BOIS, 1);
        action.act(joueur);
        assertEquals(1, joueur.getRessources().get(JoueurAres.ARME_SECRETE));
        assertEquals(0, joueur.getRessources().get(Joueur.MINERAIS));
        assertEquals(0, joueur.getRessources().get(Joueur.BOIS));
    }

    @Test
    public void testActFailure() throws Exception {
        // Pas de ressources
        action.act(joueur);
        // Ne doit pas avoir reçu l’arme
        assertEquals(0, joueur.getRessources().getOrDefault(JoueurAres.ARME_SECRETE, 0));
    }

    @Test
    public void testToString() {
        String expected = "Acheter une arme secrete ";
        assertTrue(action.toString().contains(expected));
    }
}
