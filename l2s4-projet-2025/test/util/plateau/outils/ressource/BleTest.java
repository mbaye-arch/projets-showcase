package util.plateau.outils.ressource;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class BleTest {
    private Ble ble;

    @BeforeEach
    public void setUp() {
        this.ble = new Ble();
    }

    @Test
    public void constructorTest() {
        assertNotNull(ble);
        assertTrue(ble instanceof Ble);
        assertTrue(ble instanceof Ressource);
    }

    @Test
    public void toStringTest() {
        assertEquals("Ble", ble.toString());
        assertNotEquals("", ble.toString());
    }

    @Test
    public void equalsTest() {
        assertFalse(ble.equals(null));
        assertTrue(ble.equals(ble));
        assertTrue(ble.equals(new Ble())); 
        assertFalse(ble.equals(new Mouton()));
    }
}
