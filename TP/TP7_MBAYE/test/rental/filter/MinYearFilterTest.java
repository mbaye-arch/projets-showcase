package rental.filter;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import rental.MockVehicle;
import rental.Vehicle;

public class MinYearFilterTest {

    @Test
    public void testAccept() {
        MinYearFilter filter = new MinYearFilter(2012);
        Vehicle v1 = new MockVehicle("brand1", "model1", 2015, 100.0);
        Vehicle v2 = new MockVehicle("brand2", "model2", 2000, 200.0);
        assertTrue(filter.accept(v1));
        assertFalse(filter.accept(v2));
    }
}
