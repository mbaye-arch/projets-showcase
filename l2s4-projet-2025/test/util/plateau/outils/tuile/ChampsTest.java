package util.plateau.outils.tuile;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import util.plateau.outils.position.Position;
import util.plateau.outils.ressource.Ble;


public class ChampsTest {
    private Champs champs;
    private Position pos;
    @BeforeEach
    public void setUp(){
        this.pos = new Position(0, 0);
        this.champs=new Champs(pos);
    }
    @Test
    public void testChampsConstructor() {
        assertNotNull(this.champs);
    }

    @Test
    public void testGetRessource() {
        assertNotNull(this.champs.getRessource());
        assertEquals(this.champs.getRessource(), new Ble());
    }
    @Test
    public void equalsTest(){
        assertFalse(this.champs.equals(null));
        assertFalse(this.champs.equals(this.pos));
        assertTrue(this.champs.equals(this.champs));
        assertTrue(this.champs.equals(new Champs(pos)));
    }
}
