package util.plateau.outils.ressource;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class BoisTest {
    private Bois bois;

    @BeforeEach
    public void setUp() {
        this.bois = new Bois();
    }

    @Test
    public void constructorTest() {
        assertNotNull(this.bois);
        assertTrue(bois instanceof Bois);
        assertTrue(bois instanceof Ressource);
    }

    @Test
    public void toStringTest() {
        assertEquals("Bois", this.bois.toString());
        assertNotEquals("",this.bois.toString());
    }

    @Test
    public void equalsTest() {
        assertFalse(bois.equals(null));
        assertTrue(bois.equals(bois));
        assertTrue(bois.equals(new Bois())); 
        assertFalse(bois.equals(new Mouton())); 
    }
}
