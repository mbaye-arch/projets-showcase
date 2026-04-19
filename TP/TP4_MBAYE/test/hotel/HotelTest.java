package hotel;
import hotel.util.Status;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import hotel.util.Status;


public class HotelTest {

   @Test
   public void numberOfRoomsIsCorrectAtCreation() {
      Hotel hotel = new Hotel("hotel", Status.COSY, 12);
      assertEquals(12, hotel.numberOfRooms());
      assertEquals(1, hotel.getRoom(1).getNumber());
      assertNotNull(hotel.getRoom(12));
      assertEquals(12, hotel.getRoom(12).getNumber());

   }
  
   @Test
   public void roomsAreCreatedAtCreation() {
      Hotel hotel = new Hotel("hotel", Status.COSY, 12);
      assertNotNull(hotel.getRoom(1));
      assertNotNull(hotel.getRoom(12));
   }
   
   @Test
   public void rentRoomIsPossibleWhenRoomIsFree() throws RoomNotAvailableException {
      Hotel hotel = new Hotel("hotel", Status.COSY, 12);
      Room room2 = hotel.getRoom(2);
      assertFalse(room2.isRent());
      Room resultRoom = hotel.rentRoom(2);
      assertSame(room2, resultRoom);
      assertTrue(room2.isRent());
   }

   @Test
   public void rentRoomThrowsExceptionWhenRoomIsNotFree() throws RoomNotAvailableException {
      Hotel hotel = new Hotel("hotel", Status.COSY, 12);
      Room room2 = hotel.getRoom(2);
      hotel.rentRoom(2);
      assertTrue(room2.isRent());
      // try to rent same room a second time
      assertThrows(RoomNotAvailableException.class, () -> hotel.rentRoom(2));
   }
   
   @Test   
   public void rentRoomThrowsExceptionWhenNumberIsNotValid() throws RoomNotAvailableException {
      Hotel hotel = new Hotel("hotel", Status.COSY, 12);
      // number is too great
      assertThrows(RoomNotAvailableException.class, () -> hotel.rentRoom(hotel.numberOfFreeRooms() + 10));      
      // number is negative or zero
      assertThrows(RoomNotAvailableException.class, () -> hotel.rentRoom(0));      
      assertThrows(RoomNotAvailableException.class, () -> hotel.rentRoom(-1000));      
   }
   
   
   @Test
   public void roomIsFreeAfterLeave() throws RoomNotAvailableException {
      Hotel hotel = new Hotel("hotel", Status.COSY, 12);
      Room resultRoom = hotel.rentRoom(4);
      assertTrue(resultRoom.isRent());
      hotel.leaveRoom(4);
      assertFalse(resultRoom.isRent());
   }
   
   @Test 
   public void numberOfFreeRoomsTest() throws RoomNotAvailableException {
      Hotel hotel = new Hotel("hotel", Status.COSY, 2);
      assertEquals(2, hotel.numberOfFreeRooms());
      hotel.rentRoom(1);
      hotel.rentRoom(2);
      assertEquals(0, hotel.numberOfFreeRooms());
      hotel.leaveRoom(2);
      assertEquals(1, hotel.numberOfFreeRooms());
   }
   
   @Test
   public void firstFreeNumberTestWhenHotelNotFull() throws RoomNotAvailableException {
      Hotel hotel = new Hotel("hotel", Status.COSY, 3);
      assertEquals(1, hotel.firstFreeNumber());
      hotel.rentRoom(1);
      assertEquals(2, hotel.firstFreeNumber());
      hotel.rentRoom(2);
      assertEquals(3, hotel.firstFreeNumber());
   }
   @Test
   public void freeNumberReturnsZeroWhenHotelFull() throws RoomNotAvailableException {
      Hotel hotel = new Hotel("hotel", Status.COSY, 2);
      hotel.rentRoom(1);
      hotel.rentRoom(2);
      assertEquals(0, hotel.firstFreeNumber());
   }
   

}
