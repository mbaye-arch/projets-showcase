package hotel;
import hotel.util.Status;
public class RoomMain {

    public static void main(String[] args) {
        Room someRoom = new Room(12, Status.COSY);
        System.out.println(someRoom);
    }

}
