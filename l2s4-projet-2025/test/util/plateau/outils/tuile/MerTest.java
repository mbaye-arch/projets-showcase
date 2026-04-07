package util.plateau.outils.tuile;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import util.plateau.outils.position.Position;
public class MerTest {
    private Mer mer;
    private Position pos;
    @BeforeEach
    public void setUp(){
        this.pos = new Position(0, 0);
        this.mer=new Mer(pos);
    }
    @Test
    public void testMerConstructor() {
        assertNotNull(this.mer);
    }
    @Test
    public void equalsTest(){
        assertFalse(this.mer.equals(null));
        assertFalse(this.mer.equals(this.pos));
        assertTrue(this.mer.equals(this.mer));
        assertTrue(this.mer.equals(new Mer(pos)));
    }
}
