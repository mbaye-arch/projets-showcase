package teste.othello;

import othello.*;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import othello.util.*;

public class BoardTest {
    private Board board;

    @BeforeEach
    public void setUp() {
        board = new Board();
    }

    @Test
    public void testInitialSetup() throws InvalidPositionException {
        assertNotNull(board.getPawnAt(new Position(3, 3)));
        assertNotNull(board.getPawnAt(new Position(3, 4)));
        assertNotNull(board.getPawnAt(new Position(4, 3)));
        assertNotNull(board.getPawnAt(new Position(4, 4)));
        assertNull(board.getPawnAt(new Position(0, 0)));
    }

    @Test
    public void testGetPawnAt() throws InvalidPositionException {
        Position position = new Position(3, 3);
        Pawn pawn = board.getPawnAt(position);
        assertEquals(Couleur.WHITE, pawn.getCouleur());
        assertThrows(InvalidPositionException.class, () -> {
            board.getPawnAt(new Position(8, 8));
        });
    }

    @Test
    public void testPutPawnAt() throws InvalidPositionException {
        Position position = new Position(5, 5);
        Pawn pawn = new Pawn(Couleur.BLACK);
        board.putPawnAt(position, pawn);

        assertEquals(pawn, board.getPawnAt(position));

        assertThrows(InvalidPositionException.class, () -> {
            board.putPawnAt(new Position(3, 3), pawn);
        });

        assertThrows(InvalidPositionException.class, () -> {
            board.putPawnAt(new Position(8, 8), pawn);
        });
    }

    @Test
    public void testGetPositionNull() throws InvalidPositionException {
        Position[] nullPositions = board.getPositionNull();
        assertTrue(nullPositions.length > 0);
        for (Position pos : nullPositions) {
            assertNull(board.getPawnAt(pos));
        }
    }

    @Test
    public void testEstComplet() throws InvalidPositionException {
        assertFalse(board.estComplet());

        for (int i = 0; i < 8; i++) {
            for (int j = 0; j < 8; j++) {
                if (board.getPawnAt(new Position(i, j)) == null) {
                    board.putPawnAt(new Position(i, j), new Pawn(Couleur.WHITE)); 
                }
            }
        }
        assertTrue(board.estComplet());
    }

    @Test
    public void testGetPositionProxi() throws InvalidPositionException {
        Position position = new Position(3, 3);
        Position[] proxPositions = board.getPositionProxi(position);

        assertNotNull(proxPositions);
        assertTrue(proxPositions.length > 0);
        for (Position pos : proxPositions) {
            assertTrue(pos.estPositionValide());
        }
    }

    @Test
    public void testToString() {
        String boardString = board.toString();
        assertNotNull(boardString);
        assertTrue(boardString.contains("   \n\t  0   1   2   3   4   5   6   7"));
    }
}
