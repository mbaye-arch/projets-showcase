package teste.othello;

import static org.junit.Assert.*;

import othello.OthelloGame;
import othello.OthelloGameMain;
import othello.util.*;

import org.junit.Before;
import org.junit.Test;

public class OthelloGameMainTest {
    private OthelloGameMain gameMain;

    @Before
    public void setUp() {
        gameMain = new OthelloGameMain();
    }

    @Test
    public void testOthelloGameMainInitialization() {
        assertNotNull(gameMain);
    }

    @Test
    public void testPlayMethod() throws InvalidPositionException {
        Joueur joueur1 = new Joueur("Alice", Couleur.WHITE);
        Joueur joueur2 = new Joueur("Bob", Couleur.BLACK);
        OthelloGame game = new OthelloGame(joueur1, joueur2);
        assertFalse(game.getBoard().estComplet());
        game.play();
    }
}
