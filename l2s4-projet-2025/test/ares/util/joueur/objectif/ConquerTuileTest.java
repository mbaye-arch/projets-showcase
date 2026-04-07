package ares.util.joueur.objectif;

import ares.util.batiment.Armée;
import ares.util.joueur.JoueurAres;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import util.batiment.NoValidTuilePlacementException;
import util.jeu.Jeu;
import ares.Ares;

import static org.junit.jupiter.api.Assertions.*;

public class ConquerTuileTest {

    private ConquerTuile conquerTuile;
    private JoueurAres joueur;
    private Jeu jeu;

    @BeforeEach
    public void setUp() {
        jeu = new Ares(10, 10); // Un jeu de taille 10x10
        joueur = new JoueurAres("TestPlayer");
        conquerTuile = new ConquerTuile(jeu, 3, joueur); // Objectif: 3 bâtiments
    }

    @Test
    public void testToString() {
        assertEquals("Vous devez construire 3 batiments", conquerTuile.toString());
    }

    @Test
    public void testAAtteintObjectifFalse() {
        // Aucun bâtiment encore
        assertFalse(conquerTuile.aAtteintObjectif());
    }

    @Test
    public void testAAtteintObjectifTrue() throws NoValidTuilePlacementException {
        // On ajoute des bâtiments factices au joueur
        joueur.getBatiments().add(new Armée(1, joueur));
        joueur.getBatiments().add(new Armée(1, joueur));
        joueur.getBatiments().add(new Armée(1, joueur));
        assertTrue(conquerTuile.aAtteintObjectif());
    }
}
