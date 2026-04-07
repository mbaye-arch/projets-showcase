package ares.util.joueur;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import util.batiment.NoValidTuilePlacementException;
import ares.util.batiment.Armée;
import ares.util.batiment.Camp;

import static org.junit.jupiter.api.Assertions.*;

public class JoueurAresTest {
    private JoueurAres joueur;

    @BeforeEach
    public void setUp() {
        joueur = new JoueurAres("Alice");
    }

    @Test
    public void testCreationJoueurAres() {
        assertNotNull(joueur);
        assertEquals("Alice", joueur.getName());
        assertEquals(30, joueur.getRessources().get(JoueurAres.GUERRIER));
        assertEquals(0, joueur.getRessources().get(JoueurAres.ARME_SECRETE));
    }

    @Test
    public void testGetStockGuerriers() {
        assertEquals(30, joueur.getStockGuerriers());
    }

    @Test
    public void testPossedeArmeSecrete() {
        assertFalse(joueur.possedeArmeSecrete());
        joueur.addRessource(JoueurAres.ARME_SECRETE, 1);
        assertTrue(joueur.possedeArmeSecrete());
    }

    @Test
    public void testUtiliserArmeSecrete() {
        assertFalse(joueur.utiliserArmeSecrete());
        joueur.addRessource(JoueurAres.ARME_SECRETE, 1);
        assertTrue(joueur.utiliserArmeSecrete());
        assertFalse(joueur.possedeArmeSecrete());
    }

    @Test
    public void testGetNombreGuerriers() throws NoValidTuilePlacementException {
        assertEquals(0, joueur.getNombreGuerriers());

        Armée armée = new Armée(5, joueur);
        Camp camp = new Camp(10, joueur);
        joueur.getBatiments().add(armée);
        joueur.getBatiments().add(camp);

        assertEquals(15, joueur.getNombreGuerriers());
    }

    @Test
    public void testEquals() {
        JoueurAres autreJoueur = new JoueurAres("Alice");
        assertTrue(joueur.equals(autreJoueur));

        JoueurAres joueurDifferent = new JoueurAres("Bob");
        assertFalse(joueur.equals(joueurDifferent));
    }

    @Test
    public void testToString() {
        assertEquals("Alice", joueur.toString());
    }
}