package ares.util.batiment;

import ares.util.joueur.JoueurAres;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import util.batiment.NoValidTuilePlacementException;

import static org.junit.jupiter.api.Assertions.*;

public class ArméeTest {
    private JoueurAres joueur;
    private Armée armée;

    @BeforeEach
    public void setUp() throws NoValidTuilePlacementException {
        joueur = new JoueurAres("TestPlayer");
        armée = new Armée(3, joueur);
    }

    @Test
    public void testGetNbGuerrier() {
        assertEquals(3, armée.getNbGuerrier());
    }

    @Test
    public void testSetNbGuerrier() {
        armée.setNbGuerrier(5);
        assertEquals(5, armée.getNbGuerrier());
    }

    @Test
    public void testAddGuerrier() {
        armée.addGuerrier(2);
        assertEquals(5, armée.getNbGuerrier());
    }

    @Test
    public void testEquals() throws NoValidTuilePlacementException {
        assertNotEquals(armée, null);
        assertNotEquals(armée, new Object());
        Armée sameArmée = new Armée(3, joueur);
        assertEquals(armée, sameArmée);

        Armée differentArmée = new Armée(4, joueur);
        assertNotEquals(armée, differentArmée);
    }

    @Test
    public void testToString() {
        String expected = joueur.toString() + " --> Armée : 3 guerriers";
        assertEquals(expected, armée.toString());
    }

    @Test
    public void testToStringB() {
        assertEquals("A_", armée.toStringB());
    }

    @Test
    public void testConstructorInvalidNbGuerrier() {
        assertThrows(NoValidTuilePlacementException.class, () -> {
            new Armée(0, joueur);
        });

        assertThrows(NoValidTuilePlacementException.class, () -> {
            new Armée(6, joueur);
        });
    }
}