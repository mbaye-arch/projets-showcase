package teste.othello.util;

import othello.util.*;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

public class TuplePositionTest {

    @Test
    public void testConstructorAndGetters() {
        Position pos1 = new Position(1, 2);
        Position pos2 = new Position(3, 4);
        TuplePosition tuple = new TuplePosition(pos1, pos2);

        assertEquals(pos1, tuple.getPosition1());
        assertEquals(pos2, tuple.getPosition2());
    }

    @Test
    public void testToString() {
        Position pos1 = new Position(1, 2);
        Position pos2 = new Position(3, 4);
        TuplePosition tuple = new TuplePosition(pos1, pos2);

        assertEquals("( ( 1 , 2 ) , ( 3 , 4 ) )", tuple.toString());
    }

    @Test
    public void testEquals() {
        Position pos1 = new Position(1, 2);
        Position pos2 = new Position(3, 4);
        Position pos3 = new Position(1, 2);
        Position pos4 = new Position(5, 6);

        TuplePosition tuple1 = new TuplePosition(pos1, pos2);
        TuplePosition tuple2 = new TuplePosition(pos1, pos2);
        TuplePosition tuple3 = new TuplePosition(pos3, pos4);

        assertEquals(tuple1, tuple2); 
        assertNotEquals(tuple1, tuple3); 
        assertNotEquals(tuple1, new Object()); 
    }
}
