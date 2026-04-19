package teste.othello;

import static org.junit.Assert.*;

import othello.OthelloGame;
import othello.util.*;
import org.junit.Before;
import org.junit.Test;

public class OthelloGameTest {
    private OthelloGame game;
    private Joueur joueur1;
    private Joueur joueur2;

    @Before
    public void setUp() {
        joueur1 = new Joueur("Alice", Couleur.WHITE);
        joueur2 = new Joueur("Bob", Couleur.BLACK);
        game = new OthelloGame(joueur1, joueur2);
    }

    @Test
    public void testOthelloGameInitialization() {
        assertNotNull(game);
        assertNotNull(game.getBoard());
        assertEquals(joueur1, game.getJoueur1());
        assertEquals(joueur2, game.getJoueur2());
    }

    @Test
    public void testPlayAtPosition() throws InvalidPositionException {
        Position pos = new Position(3, 2);
        assertNull(game.getBoard().getPawnAt(pos)); 

        game.playAtPosition(pos, new Pawn(joueur1.getCouleur()));

        assertNotNull(game.getBoard().getPawnAt(pos)); 
        assertEquals(Couleur.WHITE, game.getBoard().getPawnAt(pos).getCouleur());
    }

    @Test
    public void testApplyConsequence() throws InvalidPositionException {
        Position pos = new Position(3, 2);
        game.playAtPosition(pos, new Pawn(joueur1.getCouleur()));

    }

    @Test
    public void testDonneGagnant() throws InvalidPositionException {
        game.playAtPosition(new Position(3, 2), new Pawn(joueur1.getCouleur()));
        assertEquals(game.donneGagnant(),joueur1); 
    }

    @Test
    public void testPlayOneRound() throws InvalidPositionException {
        game.playOneRound(); 
    }

    @Test
    public void testPlayCompleteGame() throws InvalidPositionException {
        game.play(); 
    }
}
