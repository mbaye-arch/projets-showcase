package util.action;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import util.jeu.Jeu;
import util.joueur.Joueur;
import util.plateau.outils.ressource.Ressource;

import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

import static org.junit.jupiter.api.Assertions.*;

public class ActionTest {
    private Action action;
    private Joueur joueur;
    private Jeu jeu;

    // Sous-classe concrète de Action pour le test
    private class ActionTestImpl extends Action {
        public ActionTestImpl(HashMap<Ressource, Integer> prerequis, Jeu jeu) {
            super(prerequis, jeu);
        }

        @Override
        public void act(Joueur joueur) throws Exception {
            // Implémentation vide pour le test
        }

        @Override
        public String toString() {
            return "ActionTestImpl";
        }
    }

    @BeforeEach
    public void setUp() {
        jeu = new Jeu(10, 10) {
            @Override
            public Joueur getGagnant() {
                return null;
            }
        };
        joueur = new Joueur("Alice") {
            @Override
            public void display() {
                // Implémentation vide pour éviter les sorties dans le terminal
            }
        };
        HashMap<Ressource, Integer> prerequis = new HashMap<>();
        prerequis.put(Joueur.BOIS, 5);
        action = new ActionTestImpl(prerequis, jeu);
    }

    @Test
    public void testGetPrerequis() {
        Map<Ressource, Integer> prerequis = action.getPrerequis();
        assertNotNull(prerequis);
        assertEquals(1, prerequis.size());
        assertEquals(Integer.valueOf(5), prerequis.get(Joueur.BOIS));
    }

    @Test
    public void testGetJeu() {
        assertEquals(jeu, action.getJeu());
    }

    @Test
    public void testAPrerequis() {
        joueur.addRessource(Joueur.BOIS, 5);
        assertTrue(action.aPrerequis(joueur));

        joueur.removeRessource(Joueur.BOIS, 1);
        assertFalse(action.aPrerequis(joueur));
    }

    @Test
    public void testRetireRessource() {
        joueur.addRessource(Joueur.BOIS, 5);
        action.retireRessource(joueur);
        assertEquals(Integer.valueOf(0), joueur.getRessources().get(Joueur.BOIS));
    }

    @Test
    public void testDisplayNoRessource() {
        assertFalse(action.displayNoRessource());
    }

    @Test
    public void testDisplayActionEffectue() {
        assertTrue(action.displayActionEffectue());
    }

    @Test
    public void testDisplayPrerequis() {
        String expected = " ( Bois : 5 )";
        assertEquals(expected, action.displayPrerequis());
    }

    @Test
    public void testChoixInvalide() {
        Scanner sc = new Scanner("5\n");
        action.sc = sc;
        assertEquals(5, action.choixInvalide(5, 1, 10));
    }

    @Test
    public void testToString() {
        assertEquals("ActionTestImpl", action.toString());
    }
}