package util.plateau;

import static org.junit.Assert.*;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import org.junit.Before;
import org.junit.Test;
import util.plateau.outils.position.Position;
import util.plateau.outils.tuile.Tuile;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.List;

/**
 * Test unitaire pour la classe Plateau.
 */
public class PlateauTest {

    private Plateau plateau;

    @Before
    public void setUp() {
        plateau = new Plateau(5, 5);
    }

    @Test
    public void testPlateauDimensions() {
        assertEquals(5, plateau.getLigne());
        assertEquals(5, plateau.getColonne());
    }

    @Test
    public void testPlateauInitialization() {
        Tuile[][] tuiles = plateau.getPlateau();
        assertNotNull(tuiles);
        assertEquals(5, tuiles.length);
        assertEquals(5, tuiles[0].length);
    }

    @Test
    public void testGetTuile() {
        Position position = new Position(2, 2);
        Tuile tuile = plateau.getTuile(position);
        assertNotNull(tuile);
        assertEquals(position, tuile.getPosition());
    }

    @Test
    public void testAfficheTete() {
        String expected = "  ____________________";
        assertEquals(expected, plateau.afficheTete());
    }

    @Test
    public void testDisplay() {
        ByteArrayOutputStream outContent = new ByteArrayOutputStream();
        System.setOut(new PrintStream(outContent));

        assertDoesNotThrow(() -> plateau.display());

        System.setOut(System.out);
    }

    @Test
    public void testGetLigne() {
        assertEquals(5, plateau.getLigne());
    }

    @Test
    public void testGetColonne() {
        assertEquals(5, plateau.getColonne());
    }

    @Test
    public void testGetPlateau() {
        assertNotNull(plateau.getPlateau());
    }

    @Test
    public void testGetTuileVide() {
        List<Tuile> tuilesVides = plateau.getTuileVide();
        assertNotNull(tuilesVides);
    }

    @Test
    public void testGetTuileNonMer() {
        List<Tuile> tuilesNonMer = plateau.getTuileNonMer();
        assertNotNull(tuilesNonMer);
    }

    @Test
    public void testEstValide() {
        Position validPosition = new Position(3, 3);
        Position invalidPosition = new Position(10, 10);
        assertTrue(plateau.estValide(validPosition));
        assertFalse(plateau.estValide(invalidPosition));
    }
}
