package rental.filter;

import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

import rental.*;

public class MaxPriceFilterTest {

	
	@Test
	public void testAccept() {
		MaxPriceFilter filter = new MaxPriceFilter(150);
		Vehicle v1 = new MockVehicle("brand1","model1",2015,100.0);
		Vehicle v2 = new MockVehicle("brand2","model2",2000,200.0);
		assertTrue(filter.accept(v1));
		assertFalse(filter.accept(v2));
	}

}
