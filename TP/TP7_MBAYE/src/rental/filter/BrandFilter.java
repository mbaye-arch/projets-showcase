package rental.filter;

import rental.Vehicle;

/** a BrandFilter allows to select a Vehicle for a given brand
*/

public class BrandFilter implements VehicleFilter {
    private String brand;    
    /**
     * build a BrandFilter that selects according to given brand
     * 
     * @param brand the required brand
     */
    public BrandFilter(String brand) {
       this.brand = brand;
    }

    /**
     * accept a vehicle if its brand is the same than the required brand
     * 
     * @return <code>true</code> if v's brand is the same than the required brand
     * @see VehicleFilter#accept(Vehicle)
     */
    public boolean accept(Vehicle v) {
       return this.brand.equals(v.getBrand());
    }
}
