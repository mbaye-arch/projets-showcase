package teste.othello.util;

import othello.util.*;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

public class JoueurTest {

    @Test
    public void testGetNom() {
        Joueur joueur = new Joueur("Alice", Couleur.BLACK);
        assertEquals("Alice", joueur.getNom());
    }

    @Test
    public void testGetCouleur() {
        Joueur joueur = new Joueur("Bob", Couleur.WHITE);
        assertEquals(Couleur.WHITE, joueur.getCouleur());
    }

    @Test
    public void testToString() {
        Joueur joueur = new Joueur("Alice", Couleur.BLACK);
        assertTrue(joueur.toString().contains("nom Alice"));
        assertTrue(joueur.toString().contains("N")); 
    }

    @Test
    public void testEquals() {
        Joueur joueur1 = new Joueur("Alice", Couleur.BLACK);
        Joueur joueur2 = new Joueur("Alice", Couleur.BLACK);
        Joueur joueur3 = new Joueur("Bob", Couleur.WHITE);

        assertEquals(joueur1, joueur2);
        assertNotEquals(joueur1, joueur3);
    }
}
