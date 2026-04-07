package ares.util.batiment;

import ares.util.joueur.JoueurAres;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class CampTest {
    private JoueurAres joueur;
    private Camp camp;

    @BeforeEach
    public void setUp() {
        joueur = new JoueurAres("TestPlayer");
        camp = new Camp(3, joueur);
    }

    @Test
    public void testGetNbGuerrier() {
        assertEquals(3, camp.getNbGuerrier());
    }

    @Test
    public void testSetNbGuerrier() {
        camp.setNbGuerrier(5);
        assertEquals(5, camp.getNbGuerrier());
    }

    @Test
    public void testAddGuerrier() {
        camp.addGuerrier(2);
        assertEquals(5, camp.getNbGuerrier());
    }

    @Test
    public void testEquals() {
        assertNotEquals(camp, new Object());
        assertNotEquals(camp, null);
        Camp sameCamp = new Camp(3, joueur);
        assertEquals(camp, sameCamp);

        Camp differentCamp = new Camp(4, joueur);
        assertNotEquals(camp, differentCamp);
    }

    @Test
    public void testToString() {
        String expected = joueur.toString() + " --> Camp : 3 guerriers ";
        assertEquals(expected, camp.toString());
    }

    @Test
    public void testToStringB() {
        assertEquals("C_", camp.toStringB());
    }
}