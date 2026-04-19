package rental;

import java.util.List;

import rental.filter.*;

public class RentalAgencyMain {

	public static void main(String[] args) throws Exception {
		Vehicle v1 = new Vehicle("brand1", "model1", 2019, 80.0f);
		Vehicle v2 = new Vehicle("brand2", "model2", 2024, 200.0f);
		Vehicle v3 = new Vehicle("brand1", "model3", 2021, 130.0f);
		Vehicle v4 = new Vehicle("brand2", "model4", 2024, 90.0f);
		Client c1 = new Client("Tim Oleon", 40);
		RentalAgency agency = new RentalAgency();
		agency.addVehicle(v1);
		agency.addVehicle(v2);
		agency.addVehicle(v3);
		agency.addVehicle(v4);
		List<Vehicle> l = agency.getAllVehicle();
		for (Vehicle vehicle : l) {
			System.out.println(vehicle.toString());
		}
		agency.removeVehicle(v4);
		agency.displayAllVehicles();
		System.out.println(agency.hasRentedAVehicle(c1));
		System.out.println(agency.rentVehicle(c1, v1));
		System.out.println(agency.hasRentedAVehicle(c1));
		agency.returnVehicle(c1);
		agency.addVehicle(v4);
		agency.displayAllVehicles();
		System.out.println(agency.select(new MaxPriceFilter(100)));

		agency.displaySelection(new MinYearFilter(2021));

		AndFilter filtreComposé = new AndFilter();
		filtreComposé.addFilter(new MinYearFilter(2020));
		filtreComposé.addFilter(new MaxPriceFilter(100));
		agency.displaySelection(filtreComposé);
	}
}
