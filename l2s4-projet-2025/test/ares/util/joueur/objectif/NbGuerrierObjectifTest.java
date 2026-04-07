package ares.util.joueur.objectif;

import ares.util.batiment.Camp;
import ares.util.joueur.JoueurAres;
import ares.Ares;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import util.jeu.Jeu;

import static org.junit.jupiter.api.Assertions.*;

public class NbGuerrierObjectifTest {

    private NbGuerrierObjectif objectif;
    private JoueurAres joueur;
    private Jeu jeu;

    @BeforeEach
    public void setUp() {
        jeu = new Ares(10, 10); // Exemple de jeu
        joueur = new JoueurAres("TestPlayer");
        objectif = new NbGuerrierObjectif(jeu, joueur, 5); // Objectif = 5 guerriers
    }

    @Test
    public void testToString() {
        assertEquals("Vous devez avoir 5 guerrier(s) armée et camps compris", objectif.toString());
    }

    @Test
    public void testAAtteintObjectifFalse() {
        // Joueur a 0 guerrier
        assertFalse(objectif.aAtteintObjectif());
    }

    @Test
    public void testAAtteintObjectifTrue() {
        Camp camp = new Camp(5, joueur);
        joueur.getBatiments().add(camp);
         // Suppose que cette méthode existe pour ajouter des guerriers
        assertTrue(objectif.aAtteintObjectif());
    }

    @Test
    public void testGetNbGuerrier() {
        assertEquals(5, objectif.getNbGuerrier());
    }
}
