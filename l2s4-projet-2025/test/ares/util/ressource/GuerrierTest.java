package ares.util.ressource;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GuerrierTest {

    @Test
    void testToString() {
        Guerrier guerrier = new Guerrier();
        assertEquals("Guerrier", guerrier.toString());
    }

    @Test
    void testEquals() {
        Guerrier guerrier1 = new Guerrier();
        Guerrier guerrier2 = new Guerrier();
        Object autreObjet = new Object();

        assertEquals(guerrier1, guerrier2); // Vérifie que deux instances de Guerrier sont égales
        assertNotEquals(guerrier1, autreObjet); // Vérifie qu'un Guerrier n'est pas égal à un autre type d'objet
    }
}
