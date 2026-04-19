package rental.filter;

import rental.Vehicle;
/**
 * cette classe gere le filtre selon l'age
 */
public class MinYearFilter implements VehicleFilter {
    private double minYear;
    /**
     * constructeur du filtre avec comme donne l'age de comparaison
     * @param minYear l'age minimal
     */
    public MinYearFilter (int minYear){
        this.minYear=minYear;
}
    
    @Override
    /**
     * methode boolean qui valide si un vehicule passe le filtre 
     * @return true si le vehicule accept le filtre false sinon 
     */
    public boolean accept(Vehicle v) {
        return this.minYear<v.getProductionYear();
    }
    
}
