package util.plateau.outils.tuile;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import util.plateau.outils.position.Position;
import util.plateau.outils.ressource.Mouton;

public class PaturageTest {
    private Paturage paturage;
    private Position pos;
    @BeforeEach
    public void setUp(){
        this.pos = new Position(0, 0);
        this.paturage=new Paturage(pos);
    }
    @Test
    public void testPaturageConstructor() {
        assertNotNull(this.paturage);
    }

    @Test
    public void testGetRessource() {
        assertNotNull(this.paturage.getRessource());
        assertEquals(this.paturage.getRessource(), new Mouton());
    }
    @Test
    public void equalsTest(){
        assertFalse(this.paturage.equals(null));
        assertFalse(this.paturage.equals(this.pos));
        assertTrue(this.paturage.equals(this.paturage));
        assertTrue(this.paturage.equals(new Paturage(pos)));
    }
}
