package util.plateau.outils.tuile;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import util.plateau.outils.position.Position;

public class TuileTest {
    private Tuile champ;
    private Position pos;
    @BeforeEach
    public void setUp(){
        this.pos=new Position(0, 0);
        this.champ=new Champs(pos);
    }
    @Test
    public void testTuileConstructeur() {
        assertNotNull(this.champ);
    }
    @Test
    public void testGetPosition(){
        assertEquals(this.champ.getPosition(), new Position(0, 0));
    }
    @Test
    public void setPositionTest() {
        Position pos1 = new Position(1, 1);
        this.champ.setPosition(pos1);
        assertEquals(pos1, this.champ.getPosition());
    }

    @Test
    public void getBatimentTest(){
        assertEquals(this.champ.getBatiment(), false);
    }
    @Test
    public void setBatimentTest(){
        this.champ.setBatiment(true);
        assertTrue(this.champ.getBatiment());
    }

    @Test
    public void getNbResTest(){
        assertEquals(this.champ.getNbRes(), 0);
        this.champ.setNbRes(10);
        assertEquals(champ.getNbRes(), 10);
    }
    @Test
    public void ProdRessourcetest(){
        this.champ.prodRessource();
        assertEquals(1, this.champ.getNbRes());
    }
    @Test
    public void equalsTest(){
        assertFalse(this.champ.equals(null),"test null");
        assertFalse(this.champ.equals(this.pos),"teste avec un autre objet");
        assertTrue(this.champ.equals(this.champ),"teste avec lui meme");
        assertTrue(this.champ.equals(new Champs(pos)),"teste avec un autre objet du meme type");
    }
}
