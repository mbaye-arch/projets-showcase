package hotel;
import hotel.util.Status;
/**
 * An Hotel has a name and some rooms continuously numbered from 1
 *
 */
public class Hotel {

        private final String name;
        private Room[] rooms;
    
    /** build an Hotel with given name, status and number of rooms
        * @param name this hotel name
        * @param status status of the rooms in this hotel
        * @param numberOfRooms number of rooms of this hotel
        */
    public Hotel(String name, Status status, int numberOfRooms) {
        this.name = name;
        // TODO : initialisation de l'attribut rooms
        this.rooms = new Room[numberOfRooms];
        for (int i =0;i<numberOfRooms;i++){
            this.rooms[i]=new Room(i+1,status);
        } 
    }

        /** return this hotel name
        * @return this hotel name
        */
    public String getName() {
        return this.name;
    }


    /**  return the number of rooms for this hotel
    *teste concernés numberOfRoomsIsCorrectAtCreation()  
    * @return the number of rooms for this hotel
    */
    public int numberOfRooms() {
        return this.rooms.length;
    }
    
    /** provide the room corresponding to given number, first room has number 1, 
        * number must not be greater than <code>this.numberOfRooms()</code>
        *testes concernés roomsAreCreatedAtCreation() d
        * @param number number of the room, from 1 to this.numberOfRooms()
        * @return the room with given number
        */
    public Room getRoom(int number) {
        return this.rooms[number-1];
    }
        
    /**
     * rent a room if this is free
     * teste concernés 
     * rentRoomIsPossibleWhenRoomIsFree()
     * rentRoomThrowsExceptionWhenRoomIsNotFree()
     * rentRoomThrowsExceptionWhenNumberIsNotValid()
     * @param number numebr of room he want rent 
     * @return anything
     * @throws RoomNotAvailableException
     */
    public Room rentRoom(int number) throws RoomNotAvailableException {
        if ((number < 1) || (number>this.numberOfRooms())){
            throw new RoomNotAvailableException("nombre inferieure ou depases nombre chambre");
        }
        else if (this.getRoom(number).isRent()){
            throw new RoomNotAvailableException("chambre deja louée");
        }
        else{
            this.getRoom(number).rent();
        }
        return this.getRoom(number);
    }

    
    /**
     * rend la chambre au number libre 
     * teste concerné
     * roomIsFreeAfterLeave()
     * @param number numero de la chambre a liberer 
     */
    public void leaveRoom(int number) {
        if ((number >=1) && (number <=this.numberOfRooms())){
            this.getRoom(number).free();
        }
    }
    
    
    /**
     * return le nombre de chambre libre dans lhotel 
     * teste concerne 
     * numberOfFreeRoomsTest()
     * @return numer of room no rent 
     */
    public int numberOfFreeRooms() {
        int result=0;
        for(int i =1;i<=this.numberOfRooms();i++){
            if (this.getRoom(i).isRent()==false){
                result = result+1;
            }
        }
        return result ;
    }   
    
    /**
     * cette methode retourn le numero de la chambre libre sinon 0
     * teste concernes 
     * firstFreeNumberTestWhenHotelNotFull()
     * freeNumberReturnsZeroWhenHotelFull()
     * @return numero du chambre libre 
     */
    public int firstFreeNumber() {
        if (this.numberOfFreeRooms() ==0){
            return 0;
        }
        else{
            int i=1;
            while (i<=this.numberOfRooms()&& this.getRoom(i).isRent()){
                i++;
            }
            return i;
        }
    }

    
}
