package demeter.util.ressource;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class VoleurTest {

    @Test
    void testEquals() {
        Voleur voleur1 = new Voleur();
        Voleur voleur2 = new Voleur();
        Object autreObjet = new Object();

        assertEquals(voleur1, voleur2, "Deux instances de Voleur doivent être égales.");
        assertNotEquals(voleur1, autreObjet, "Une instance de Voleur ne doit pas être égale à un objet d'une autre classe.");
    }

    @Test
    void testToString() {
        Voleur voleur = new Voleur();
        assertEquals("Voleur", voleur.toString(), "La méthode toString() doit retourner 'Voleur'.");
    }
}
