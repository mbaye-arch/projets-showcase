package teste.othello.util;

import othello.util.*;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

public class PawnTest {

    @Test
    public void testConstructorAndGetCouleur() {
        Pawn pawnBlack = new Pawn(Couleur.BLACK);
        Pawn pawnWhite = new Pawn(Couleur.WHITE);

        assertEquals(Couleur.BLACK, pawnBlack.getCouleur());
        assertEquals(Couleur.WHITE, pawnWhite.getCouleur());
    }

    @Test
    public void testEquals() {
        Pawn pawn1 = new Pawn(Couleur.BLACK);
        Pawn pawn2 = new Pawn(Couleur.BLACK);
        Pawn pawn3 = new Pawn(Couleur.WHITE);

        assertEquals(pawn1, pawn2);
        assertNotEquals(pawn1, pawn3);
    }

    @Test
    public void testReverse() {
        Pawn pawn = new Pawn(Couleur.BLACK);
        pawn.reverse();
        assertEquals(Couleur.WHITE, pawn.getCouleur());

        pawn.reverse();
        assertEquals(Couleur.BLACK, pawn.getCouleur());
    }

    @Test
    public void testToString() {
        Pawn pawnBlack = new Pawn(Couleur.BLACK);
        Pawn pawnWhite = new Pawn(Couleur.WHITE);

        assertEquals("N", pawnBlack.toString());
        assertEquals("B", pawnWhite.toString());
    }

    @Test
    public void testGetPionInverse() {
        Pawn pawnBlack = new Pawn(Couleur.BLACK);
        Pawn pawnWhite = new Pawn(Couleur.WHITE);

        Pawn inverseFromBlack = pawnBlack.getPionInverse();
        Pawn inverseFromWhite = pawnWhite.getPionInverse();

        assertEquals(Couleur.WHITE, inverseFromBlack.getCouleur());
        assertEquals(Couleur.BLACK, inverseFromWhite.getCouleur());
    }
}
