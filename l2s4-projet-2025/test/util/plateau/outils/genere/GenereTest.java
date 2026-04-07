package util.plateau.outils.genere;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import util.plateau.outils.position.Position;
import util.plateau.outils.tuile.*;

import java.util.List;

public class GenereTest {
    private Genere genere;
    private int lignes; 
    private int colonnes;
    @BeforeEach
    public void before() {
        this.lignes=10;
        this.colonnes=9;
        this.genere = new Genere(lignes, colonnes);
    }
    @Test
    void testDonneListePosition() {
        List<Position> positions = this.genere.donneLIstePosition();
        assertEquals(this.lignes * this.colonnes, positions.size());
        for (int i = 0; i < this.lignes; i++) {
            for (int j = 0; j < this.colonnes; j++) {
                assertTrue(positions.contains(new Position(i, j)));
            }
        }
    }

    @Test
    void testGenereTuile() {
        Position pos = new Position(1, 1);
        Tuile tuile = this.genere.genereTuile(pos);
        assertNotNull(tuile);
        assertEquals(pos, tuile.getPosition());
    }

    @Test
    void testGenerateListeTuile() {
        List<Tuile> tuiles = this.genere.generateListeTuile();
        assertFalse(tuiles.isEmpty());
        int res=0;
        // teste 2/3 de type Mer 
        for (Tuile tuile : tuiles) {
            if (tuile instanceof Mer){
                res=res+1;
                assertNotNull(tuile);
            }
        }
        assertTrue(res>=((this.lignes*this.colonnes)*2)/3);
    }
}



