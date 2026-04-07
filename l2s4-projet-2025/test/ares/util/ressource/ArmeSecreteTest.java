package ares.util.ressource;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class ArmeSecreteTest {
    @Test
    public void testToString() {
        ArmeSecrete armeSecrete = new ArmeSecrete();
        assertEquals("Arme secrete", armeSecrete.toString());
    }
    @Test
    public void testEquals() {
        ArmeSecrete armeSecrete1 = new ArmeSecrete();
        ArmeSecrete armeSecrete2 = new ArmeSecrete();
        assertEquals(armeSecrete1, armeSecrete2);

        Object differentObject = new Object();
        assertNotEquals(armeSecrete1, differentObject);
    }
}