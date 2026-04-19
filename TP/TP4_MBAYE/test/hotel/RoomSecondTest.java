package hotel;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import hotel.util.Status;


public class RoomSecondTest {

   @Test
   public void numberAndRentAreCorrectAtCreation() {
      Room room = new Room(12);
      assertFalse(room.isRent());
      assertEquals(12, room.getNumber());
   }
   
   @Test
   public void defaultStatusIsConfort() {
      Room room = new Room(12);
      assertEquals(Status.CONFORT, room.getStatus());
   }

   @Test
   public void statusIsCorrectAtCreation() {
      Room room = new Room(12, Status.PREMIUM);
      assertEquals(Status.PREMIUM, room.getStatus());
   }

}
