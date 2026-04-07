package util.plateau.outils.ressource;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class MoutonTest {
    private Mouton mouton;

    @BeforeEach
    public void setUp() {
        this.mouton = new Mouton();
    }

    @Test
    public void constructorTest() {
        assertNotNull(this.mouton);
        assertTrue(mouton instanceof Mouton);
        assertTrue(mouton instanceof Ressource);
    }

    @Test
    public void toStringTest() {
        assertEquals("Mouton", this.mouton.toString());
        assertNotEquals("",this.mouton.toString());
    }

    @Test
    public void equalsTest() {
        assertFalse(this.mouton.equals(null));
        assertTrue(this.mouton.equals(this.mouton));
        assertTrue(this.mouton.equals(new Mouton()));
    }
}
