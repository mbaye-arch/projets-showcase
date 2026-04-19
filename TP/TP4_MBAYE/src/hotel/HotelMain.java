package hotel;

import hotel.util.Status;

public class HotelMain {
    public static void usage() {
        System.out.println("Usage : java Hotel <number of room on the Hotel>");
        System.out.println("Saisissez une valeur pour le nombre de chambre dans l'hotel\nDoit etre compris entre 1 et 100 compris");
        System.out.println("Une entree qui n'est pas une valeur vas renvoyer une erreur ");
        System.out.println("Entrer toujours une valeur positif");
        System.exit(0);
    }
    public static void main(String[] args) throws RoomNotAvailableException {
        Hotel hotel = new Hotel("Hotel California", Status.PREMIUM, 100);
        System.out.println("Nombre de Chambre  : "+hotel.numberOfRooms());
        if (args.length==1){
            int value = Integer.parseInt(args[0]);
            hotel.rentRoom(value);
            System.out.println(hotel.getRoom(value).toString());
            System.out.println("Nombre de Chambre Libre : "+hotel.numberOfFreeRooms());
        }
        else{
            HotelMain.usage();
        }
    }
}
