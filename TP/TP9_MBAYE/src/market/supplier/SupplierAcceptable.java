package market.supplier;

import java.util.*;
import market.Order;

/**
 * cette classe represente les fournisseurs qui choisissent parmi
 * la liste de toutes les commandes proposées,
 * la commande acceptable pour laquelle ils réalisent la marge la plus
 * importante.
 */
public class SupplierAcceptable extends Supplier {

    /**
     * constructeur SupplierAcceptable
     * 
     * @param nom           nom du fournisseur
     * @param niveauQualite niveau de qualite requis
     * @param coutUnitaire  cout uniatire de production
     */
    public SupplierAcceptable(String nom, int niveauQualite, double coutUnitaire) {
        super(nom, niveauQualite, coutUnitaire);
    }

    /**
     * cette methode renvoie a marge qu'aura un fournisseur avec une commande
     * 
     * @param commande la commande dont il veut la marge
     * @return double la marge
     */
    private double marge(Order commande) {
        return commande.coutTotale() - super.coutProduction(commande);
    }

    /**
     * cette methode renvoie la les commandes qui passe la mare
     * 
     * @param l liste des commandes
     * @return List<Order>
     */
    private List<Order> ontMarge(List<Order> l) {
        List<Order> res = new ArrayList<>();
        for (Order order : l) {
            if (super.canAccept(order) && this.marge(order) > 0) {
                res.add(order);
            }
        }
        return res;
    }

    /**
     * cette methode regarde la liste des commandes qui passe la marge
     * et regarde le plus grand marge et le retourne sil ya des egalites il retourne
     * le prioritaire sinon sil ny a rien sa retourne null
     * 
     * @param l liste de commande
     * @return List<Order>
     */
    private Order maxMarge(List<Order> l) {
        List<Order> acceptable = this.ontMarge(l);
        if (acceptable.isEmpty()) {
            return null;
        }
        Order res = acceptable.get(0);
        for (Order order : acceptable) {
            if (this.marge(order) > this.marge(res)) {
                res = order;
            }
        }
        return res;
    }

    /**
     * cette methode permet au fournisseur de choisir une commande
     * 
     * @return Order
     */
    @Override
    public Order choseOrder(List<Order> l) {
        return this.maxMarge(l);
    }
}
