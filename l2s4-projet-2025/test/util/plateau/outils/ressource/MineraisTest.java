package util.plateau.outils.ressource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class MineraisTest {
    private Minerais minerais;

    @BeforeEach
    void setUp() {
        minerais = new Minerais();
    }

    @Test
    void constructorTest() {
        assertNotNull(minerais);
        assertTrue(minerais instanceof Minerais);
        assertTrue(minerais instanceof Ressource);
    }

    @Test
    void equalsTest() {
        Minerais autreMinerais = new Minerais();
        assertTrue(minerais.equals(autreMinerais));
    }

    @Test
    void toStringTest() {
        assertEquals("Minerais", this.minerais.toString());
        assertNotEquals("",this.minerais.toString());
    }
}
