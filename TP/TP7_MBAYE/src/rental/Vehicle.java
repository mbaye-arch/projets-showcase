package rental;

/**
 * A class to model Vehicle defined 
 */
public class Vehicle {

	private String brand;
	private String model;
	private int productionYear;
	private double dailyRentalPrice;

	/**
	 * creates a vehivle with given informations
	 * 
	 * @param brand            the vehicle's brand
	 * @param model            the vehicle's model
	 * @param productionYear   the vehicle's production year
	 * @param dailyRentalPRice the daily rental price
	 */
	public Vehicle(String brand, String model, int productionYear, double dailyRentalPrice) {
		this.brand = brand;
		this.model = model;
		this.productionYear = productionYear;	
		this.dailyRentalPrice = dailyRentalPrice;
	}

	/**
	 * @return the brand for this vehicle
	 */
	public String getBrand() {
		return this.brand;
	}

	/**
	 * @return the model for this vehicle
	 */
	public String getModel() {
		return this.model;
	}

	/**
	 * @return the production year for this vehicle
	 */
	public int getProductionYear() {
		return this.productionYear;
	}

	/**
	 * @return this vehicle daily price
	 */
	public double getDailyPrice() {
		return this.dailyRentalPrice;
	}

	/**
	 * this vehicle is equals to another if they have same brand, model,
	 * production year and daily rental price
	 * 
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	public boolean equals(Object o) {
		if (o instanceof Vehicle) {
			Vehicle theOther = ((Vehicle) o);
			return this.brand.equals(theOther.brand)
					&& this.model.equals(theOther.model)
					&& this.productionYear == theOther.productionYear
					&& this.dailyRentalPrice == theOther.dailyRentalPrice;
		} else {
			return false;
		}
	}

	public String toString() {
		return this.productionYear + " " + this.brand + " " + this.dailyRentalPrice;
	}
}
