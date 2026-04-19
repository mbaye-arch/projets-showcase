package hotel;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

public class RoomTest {

   @Test
   public void numberAndRentAreCorrectAtCreation() {
      Room room = new Room(12);
      assertFalse(room.isRent());
      assertEquals(12, room.getNumber());
   }


   @Test
   public void rentRoomTest() {
      Room room = new Room(12);
      assertFalse(room.isRent());
      room.rent();
      assertTrue(room.isRent());
   }
   
   @Test
   public void freeRoomTest() {
      Room room = new Room(12);
      room.rent();
      assertTrue(room.isRent());
      room.free();
      assertFalse(room.isRent());
   }
   
   @Test
   public void roomsAreEqualsIfSameNumber() {
      Room room1 = new Room(12);
      Room room2 = new Room(12);
      assertTrue(room1.equals(room2));      
   }
   
   @Test
   public void roomsAreNotEqualsIfNotSameNumber() {
      Room room1 = new Room(12);
      Room room2 = new Room(14);
      assertFalse(room1.equals(room2));      
   }
   


}
