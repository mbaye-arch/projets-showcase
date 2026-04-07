package util.plateau.outils.tuile;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import util.plateau.outils.position.Position;
import util.plateau.outils.ressource.Bois;

public class ForetTest {
    private Foret foret;
    private Position pos;
    @BeforeEach
    public void setUp(){
        this.pos = new Position(0, 0);
        this.foret=new Foret(pos);
    }
    @Test
    public void testForetConstructor() {
        assertNotNull(this.foret);
    }

    @Test
    public void testGetRessource() {
        assertNotNull(this.foret.getRessource());
        assertEquals(this.foret.getRessource(), new Bois());
    }
    @Test
    public void equalsTest(){
        assertFalse(this.foret.equals(null));
        assertFalse(this.foret.equals(this.pos));
        assertTrue(this.foret.equals(this.foret));
        assertTrue(this.foret.equals(new Foret(pos)));
    }
}

