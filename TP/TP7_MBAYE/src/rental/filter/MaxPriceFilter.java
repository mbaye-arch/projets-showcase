package rental.filter;

import rental.Vehicle;

/**
 * a MaxPriceFilter allows to select a vehicle if its daily rental price is lower than a given price
*/
public class MaxPriceFilter implements VehicleFilter {
    private double maxPrice;
    /** build a MaxPriceFilter with the given max price
     * @param maxPrice the maximal rental price */
    public MaxPriceFilter(double maxPrice) {
        this.maxPrice = maxPrice;
    }
    /**  accept a vehicle if its daily rental price is lower than the maximal price
     * @return <code>true</code> if v's daily rental price is lower than the maximal price
     * @see VehicleFilter#accept(Vehicle) 
     */
    public boolean accept(Vehicle v) {
        return this.maxPrice > v.getDailyPrice();
    }
}
