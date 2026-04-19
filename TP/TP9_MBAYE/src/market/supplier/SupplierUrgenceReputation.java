package market.supplier;

import java.util.*;

import market.Order;

/**cette classe represente les fournisseurs qui adoptent ce critère d’urgence on en trouve qui nuancent un peu ce choix. Soucieux
 * de leur réputation, ils n’acceptent pas des commandes dont la qualité est trop faible, même s’il pourrait la
 * satisfaire. 
 * */
public class SupplierUrgenceReputation extends SupplierUrgence {
    private int seuil;

    /**
     * constructeur SupplierUrgenceReputation
     * 
     * @param nom           om du fournisseur
     * @param niveauQualite niveau de qualite requis
     * @param coutUnitaire  cout uniatire de production
     * @param seuil         le seuil de qualite quil accepte
     */
    public SupplierUrgenceReputation(String nom, int niveauQualite, double coutUnitaire, int seuil) {
        super(nom, niveauQualite, coutUnitaire);
        this.seuil = seuil;
    }

    /**
     * cette methode prend une commande et regarde sil correspond au condition des
     * ce types de fournisseur
     * 
     * @param commande la commande a verifier
     * @return boolean
     */
    private boolean estAcceptable(Order commande) {
        return super.canAccept(commande) && (commande.getMinQuality() >= this.seuil);
    }

    /**
     * cette retourne la commande accepte par le fournisseur
     * 
     * @param l la liste de commande
     * @return Order la commande accepte
     */
    @Override
    public Order choseOrder(List<Order> l) {
        Order prioritaire = null;

        for (Order commande : super.getOrderAccept(l)) {
            if (this.estAcceptable(commande)) {
                if (prioritaire == null || commande.getMinQuality() > prioritaire.getMinQuality()) {
                    prioritaire = commande;
                }
            }
        }
        return prioritaire;
    }

    /**
     * cette methode dit si un fournisseur est egal a une autre
     * en y ajoutant le seuil comme camparaison
     * 
     * @return boolean
     */
    public boolean equals(Object o) {
        return super.equals(o) && ((SupplierUrgenceReputation) o).seuil == this.seuil;
    }
}
