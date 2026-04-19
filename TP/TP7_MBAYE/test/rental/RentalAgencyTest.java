package rental;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import rental.filter.*;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RentalAgencyTest {

    private RentalAgency rentalAgency;
    private Vehicle vehicle1;
    private Vehicle vehicle2;
    private Client client1;
    private Client client2;

    protected Vehicle createVehicle(String brand, String model, int productionYear, Double dailyRentalPrice) {
        return new MockVehicle(brand, model, productionYear, dailyRentalPrice);
    }

    @BeforeEach
    public void before() {
        rentalAgency = new RentalAgency();
        client1 = new Client("John Doe", 30);
        client2 = new Client("Jane Smith", 25);
        this.vehicle1 = this.createVehicle("brand1", "model1", 2015, 100.);
        this.vehicle2 = this.createVehicle("brand2", "model2", 2000, 200.);
    }

    @Test
    public void testAddVehicle() {
        rentalAgency.addVehicle(vehicle1);
        rentalAgency.addVehicle(vehicle2);
        List<Vehicle> vehicles = rentalAgency.getAllVehicle();
        assertEquals(2, vehicles.size());
        assertTrue(vehicles.contains(vehicle1));
        assertTrue(vehicles.contains(vehicle2));
    }

    @Test
    public void testRemoveVehicle() throws UnknownVehicleException {
        rentalAgency.addVehicle(vehicle1);
        rentalAgency.removeVehicle(vehicle1);
        List<Vehicle> vehicles = rentalAgency.getAllVehicle();
        assertFalse(vehicles.contains(vehicle1));
    }

    @Test
    public void testRemoveVehicleThrowsUnknownVehicleException() {
        assertThrows(UnknownVehicleException.class, () -> rentalAgency.removeVehicle(vehicle1));
    }

    @Test
    public void testRentVehicle() throws UnknownVehicleException {
        rentalAgency.addVehicle(vehicle1);
        double price = rentalAgency.rentVehicle(client1, vehicle1);
        assertEquals(100.0, price);
        assertTrue(rentalAgency.hasRentedAVehicle(client1));
        assertTrue(rentalAgency.isRented(vehicle1));
    }

    @Test
    public void testRentVehicleThrowsIllegalStateExceptionIfAlreadyRented() throws UnknownVehicleException {
        rentalAgency.addVehicle(vehicle1);
        rentalAgency.rentVehicle(client1, vehicle1);
        assertThrows(IllegalStateException.class, () -> rentalAgency.rentVehicle(client2, vehicle1));
    }

    @Test
    public void testRentVehicleThrowsUnknownVehicleExceptionIfNotInAgency() {
        assertThrows(UnknownVehicleException.class, () -> rentalAgency.rentVehicle(client1, vehicle1));
    }

    @Test
    public void testReturnVehicle() throws UnknownVehicleException {
        rentalAgency.addVehicle(vehicle1);
        rentalAgency.rentVehicle(client1, vehicle1);
        rentalAgency.returnVehicle(client1);
        assertFalse(rentalAgency.hasRentedAVehicle(client1));
        assertFalse(rentalAgency.isRented(vehicle1));
    }

    @Test
    public void testAllRentedVehicles() throws UnknownVehicleException {
        rentalAgency.addVehicle(vehicle1);
        rentalAgency.addVehicle(vehicle2);
        rentalAgency.rentVehicle(client1, vehicle1);
        List<Vehicle> rentedVehicles = new ArrayList<>(rentalAgency.allRentedVehicles());
        assertEquals(1, rentedVehicles.size());
        assertTrue(rentedVehicles.contains(vehicle1));
        assertFalse(rentedVehicles.contains(vehicle2));
    }

    @Test
    public void testSelectWithFilter() {
        rentalAgency.addVehicle(vehicle1);
        rentalAgency.addVehicle(vehicle2);
        List<Vehicle> liste = rentalAgency.select(new MinYearFilter(2014));
        assertTrue(liste.contains(vehicle1));
        assertFalse(liste.contains(vehicle2));
    }

    @Test
    public void testdisplaySelection() {
        rentalAgency.addVehicle(vehicle1);
        rentalAgency.addVehicle(vehicle2);
        AndFilter filtreCompose = new AndFilter();
        filtreCompose.addFilter(new MinYearFilter(2000));
        filtreCompose.addFilter(new MaxPriceFilter(150));
        rentalAgency.displaySelection(filtreCompose);
        ;
    }
}
