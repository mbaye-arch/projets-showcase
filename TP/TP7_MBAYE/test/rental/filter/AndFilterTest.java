package rental.filter;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.Test;

import rental.MockVehicle;
import rental.Vehicle;

public class AndFilterTest {
    @Test
	public void testAccept() {
        MinYearFilter filter1 = new MinYearFilter(2012);
		MaxPriceFilter filter2 = new MaxPriceFilter(150);
        AndFilter filtreCompose = new AndFilter();
        filtreCompose.addFilter(filter1);
        filtreCompose.addFilter(filter2);
		Vehicle v1 = new MockVehicle("brand1","model1",2015,300.0);
		Vehicle v2 = new MockVehicle("brand2","model2",2000,200.0);
		assertTrue(filtreCompose.accept(v1));
		assertFalse(filtreCompose.accept(v2));
	}
}
