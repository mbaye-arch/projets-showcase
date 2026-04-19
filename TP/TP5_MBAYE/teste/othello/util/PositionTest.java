package teste.othello.util;

import othello.util.*;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

public class PositionTest {

    @Test
    public void testConstructorAndGetters() {
        Position pos = new Position(3, 5);
        assertEquals(3, pos.getX());
        assertEquals(5, pos.getY());
    }

    @Test
    public void testEquals() {
        Position pos1 = new Position(2, 4);
        Position pos2 = new Position(2, 4);
        Position pos3 = new Position(3, 4);

        assertEquals(pos1, pos2);
        assertNotEquals(pos1, pos3);
    }

    @Test
    public void testToString() {
        Position pos = new Position(1, 2);
        assertEquals("( 1 , 2 )", pos.toString());
    }

    @Test
    public void testEstPositionValide() {
        Position validPos = new Position(0, 0);
        Position invalidPos1 = new Position(-1, 0);
        Position invalidPos2 = new Position(8, 8);

        assertTrue(validPos.estPositionValide());
        assertFalse(invalidPos1.estPositionValide());
        assertFalse(invalidPos2.estPositionValide());
    }

    @Test
    public void testGetDirection() {
        Position pos1 = new Position(2, 3);
        Position pos2 = new Position(4, 5);
        Position direction = pos1.getDirection(pos2);

        assertEquals(-2, direction.getX());
        assertEquals(-2, direction.getY());
    }

    @Test
    public void testSontCoteACot() {
        Position pos1 = new Position(1, 1);
        Position pos2 = new Position(1, 2); 
        Position pos3 = new Position(3, 3); 

        assertTrue(pos1.SontCoteACot(pos2));
        assertFalse(pos1.SontCoteACot(pos3));
    }

    @Test
    public void testGetPositionDirection() {
        Position pos = new Position(2, 2);
        Position direction = new Position(1, 0);
        Position newPos = pos.getPositionDirection(direction);

        assertEquals(3, newPos.getX());
        assertEquals(2, newPos.getY());
    }
}
