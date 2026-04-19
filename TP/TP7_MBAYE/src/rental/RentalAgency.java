package rental;

import java.util.*;

import rental.filter.VehicleFilter;

/**
 * cette classe represente RentalAgency
 */
public class RentalAgency {
    private List<Vehicle> allVehicles;
    private Map<Client, Vehicle> rentals;

    /**
     * Constructeur de la classes
     */
    public RentalAgency() {
        this.allVehicles = new ArrayList<Vehicle>();
        this.rentals = new HashMap<Client, Vehicle>();
    }

    /**
     * cette methode ajout une vehicle a la liste des vehicule que a l'agence
     * 
     * @param vla voiture a ajoute
     */
    public void addVehicle(Vehicle v) {
        this.allVehicles.add(v);
    }

    /**
     * cette methode permet laffichage de tous les vehicle en utilisant
     * la methode displayListOfVehicle
     */
    public void displayAllVehicles() {
        this.displayListOfVehicle(this.allVehicles);
    }

    /**
     * cette methode permet d'obtenir lensemble des vehicle que detiennent l'agence
     * 
     * @return List<Vehicle>return la liste des vehicule
     */
    public List<Vehicle> getAllVehicle() {
        return this.allVehicles;
    }

    /**
     * cette methode enleve une voiture de la liste des vehicule que a l'agence
     * 
     * @param v le vehicule a enlever
     * @throws UnknownVehicleException si la vehicule nest pas dans lagence on a une
     *                                 UnknowVehicleException
     */
    public void removeVehicle(Vehicle v) throws UnknownVehicleException {
        if (this.allVehicles.contains(v)) {
            this.allVehicles.remove(v);
        } else {
            throw new UnknownVehicleException("vehicule non gere");
        }
    }

    /**
     * cette methode renvoie true si le client a loue une vehicule
     * 
     * @param c le clien
     * @return boolean ltrue ou false selon le client est locataire ou pas
     */
    public boolean hasRentedAVehicle(Client c) {
        return this.rentals.containsKey(c);
    }

    /**
     * cette methode renvoie true si le vehicule passe en parametre est deja loue
     * 
     * @param v le vehicule en parametre
     * @return booleean selon le vehicule est loue ou pas
     */
    public boolean isRented(Vehicle v) {
        return this.rentals.containsValue(v);
    }

    /**
     * cette methode permet la location dun vehicule par un client
     * et renvoie le prix de location
     * 
     * @param c le client qui loue la voiture
     * @param v le vehicule a loueur
     * @return int le prix de la voiture a louer
     * @throws UnknownVehicleException si la vehicule nest pas detenue par l'agence
     * @throws IllegalStateException   si le client a deja loue une voiture oubien
     *                                 le voiture est
     *                                 deja loue
     */
    public double rentVehicle(Client c, Vehicle v) throws UnknownVehicleException {
        if (this.hasRentedAVehicle(c) || this.isRented(v)) {
            throw new IllegalStateException();
        } else if (!this.allVehicles.contains(v)) {
            throw new UnknownVehicleException();
        } else {
            this.rentals.put(c, v);
            return v.getDailyPrice();
        }
    }

    /**
     * cette methode return le voiture que le client a deja louer
     * 
     * @param c le client qui avait louer
     */
    public void returnVehicle(Client c) {
        this.rentals.remove(c);
    }

    /**
     * cette methode met dans une collection l'ensemble des vehicules louer
     * 
     * @return Collection<Vehicle> lensemlbe des vehicules louer
     */
    public Collection<Vehicle> allRentedVehicles() {
        return this.rentals.values();
    }

    /**
     * cette methode permet le filtre dun vehicule selon
     * le filtre passe en parametre les conditions de filtres
     * 
     * @param filter le filtre a applique pour avoir les voitures qui valide le
     *               filtre
     * @return List<Vehicle> la liste des vehicules qui ont valide le filtre
     */
    public List<Vehicle> select(VehicleFilter filter) {
        List<Vehicle> liste = new ArrayList<Vehicle>();
        for (Vehicle vehicle : this.allVehicles) {
            if (filter.accept(vehicle)) {
                liste.add(vehicle);
            }
        }
        return liste;
    }

    /**
     * cette methode permet la lecture des vehicules de l'agence
     * 
     * @param alist list<Vehicle>
     */
    private void displayListOfVehicle(List<Vehicle> alist) {
        for (Vehicle vehicle : alist) {
            System.out.println(vehicle.toString() + "\n");
        }
    }

    /**
     * cette methode affiche la liste des vehicules qui accpete le filtre applique
     * 
     * @param filter le filtre a accepte
     */
    public void displaySelection(VehicleFilter filter) {
        this.displayListOfVehicle(this.select(filter));
    }
}
