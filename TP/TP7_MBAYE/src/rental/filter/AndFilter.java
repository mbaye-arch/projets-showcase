package rental.filter;

import java.util.*;
import rental.Vehicle;

/**
 * classe representant andFilter
 * qui sont un ensemble de filtre a
 * appliquer sur une vehicle
 */
public class AndFilter implements VehicleFilter {
    private List<VehicleFilter> theFilters;

    /**
     * COnstructeur de la classe
     * qui ne prend rien en parametre
     */
    public AndFilter() {
        theFilters = new ArrayList<>();
    }

    /**
     * methode void qui permet d'ajouter un element de filtre dans la
     * listes de filtre a appliquer a la voiture
     * 
     * @param f le filtre a y ajouter
     */
    public void addFilter(VehicleFilter f) {
        this.theFilters.add(f);
    }

    /**
     * methode herite de linterfacce
     * qui valide lensemble des filtres sur le vehicle v
     * 
     * @return boolean si tous les filtres sont valides
     */
    @Override
    public boolean accept(Vehicle v) {
        int i = 0;
        while (i < this.theFilters.size() && this.theFilters.get(i).accept(v)) {
            i = i + 1;
        }
        return i > this.theFilters.size();
    }

    /**
     * cette methode return la liste
     * 
     * @return theFilters listes des filtres
     */
    public List<VehicleFilter> getTheFilters() {
        return theFilters;
    }

}
