package market.supplier;

import java.util.*;

import market.Order;

/**
 * cette classes represente les fournisseurs qui donnent priorité à l’urgence et
 * choisissent
 * dans la liste des commandes fournies, la plus prioritaire parmi celles qui
 * sont acceptables pour eux.
 */
public class SupplierUrgence extends Supplier {
    /**
     * constructeur de la classe abstraite
     * 
     * @param nom           nom du fournisseur
     * @param niveauQualite niveau qualite requis
     * @param coutUnitaire  cout unitaire de sa production
     */
    public SupplierUrgence(String nom, int niveauQualite, double coutUnitaire) {
        super(nom, niveauQualite, coutUnitaire);
    }

      /**
     * cette retourne la commande accepte par le fournisseur 
     * @param l la liste de commande
     * @return Order la commande accepte 
     */
    @Override
    public Order choseOrder(List<Order> l) {
        if (super.getOrderAccept(l).size() > 0) {
            return super.getOrderAccept(l).get(0);
        } else {
            return null;
        }
    }
}
