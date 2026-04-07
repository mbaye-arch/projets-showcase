package util.plateau.outils.tuile;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import util.plateau.outils.position.Position;
import util.plateau.outils.ressource.Minerais;


public class MontagneTest {
    private Montagne montagne;
    private Position pos;
    @BeforeEach
    public void setUp(){
        this.pos = new Position(0, 0);
        this.montagne=new Montagne(pos);
    }
    @Test
    public void testMontagneConstructor() {
        assertNotNull(this.montagne);
    }

    @Test
    public void testGetRessource() {
        assertNotNull(this.montagne.getRessource());
        assertEquals(this.montagne.getRessource(), new Minerais());
    }
    @Test
    public void testProdRessource() {
        this.montagne.prodRessource();
        assertEquals(1, this.montagne.getNbRes());
    }
    @Test
    public void equalsTest(){
        assertFalse(this.montagne.equals(null));
        assertFalse(this.montagne.equals(this.pos));
        assertTrue(this.montagne.equals(this.montagne));
        assertTrue(this.montagne.equals(new Montagne(pos)));
    }
}
