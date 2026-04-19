package rental;

import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

public class VehicleTest {

   private Vehicle v1;
   private Vehicle v2;

   protected Vehicle createVehicle(String brand, String model, int productionYear, Double dailyRentalPrice) {
      return new MockVehicle(brand, model, productionYear, dailyRentalPrice);
   }

   @BeforeEach
   public void before() {
      this.v1 = this.createVehicle("brand1", "model1", 2015, 100.);
      this.v2 = this.createVehicle("brand2", "model2", 2000, 200.);
   }

   @Test
   public void testGetBrand() {
      assertEquals("brand1", this.v1.getBrand());
      assertEquals("brand2", this.v2.getBrand());
   }

   @Test
   public void testGetModel() {
      assertEquals("model1", this.v1.getModel());
      assertEquals("model2", this.v2.getModel());
   }

   @Test
   public void testGetDailyPrice() {
      assertEquals(100.0f, this.v1.getDailyPrice(), 0.0001);
      assertEquals(200.0f, this.v2.getDailyPrice(), 0.0001);
   }

   @Test
   public void testGetProductionYear() {
      assertEquals(2015, this.v1.getProductionYear());
      assertEquals(2000, this.v2.getProductionYear());
   }

   @Test
   public void testEquals() {
      Vehicle v3 = this.createVehicle("brand1", "model1", 2015, 100.);
      Vehicle v4 = this.createVehicle("brand1", "model1", 2015, 200.);
      assertTrue(v1.equals(v3));
      assertFalse(v1.equals(v2));
      assertFalse(v1.equals(v4));
      assertFalse(v1.equals(new Object()));
   }


}
