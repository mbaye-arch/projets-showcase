package market;

import java.util.*;
import market.supplier.*;
import market.util.*;

/**
 * Un marché collecte des commandes et les propose à une liste de fournisseurs.
 * A un instant donné, un fournisseur
 * ne peut gérer qu’une seule commande.
 * Un marché possède une liste de ses fournisseurs et gère une table qui, à un
 * moment donné, associe au nom d’un
 * fournisseur la commande que le fournisseur a accepté et qu’il est donc en
 * train de gérer. Un fournisseur qui n’a
 * pas de commande n’est pas présent dans cette table.
 */
public class Market {
    private List<Supplier> fournisseurs;
    private Map<Supplier, Order> fournisseurOder;

    /**
     * constructeur de la classe Market
     * avec ces liste vide
     */
    public Market() {
        this.fournisseurs = new ArrayList<>();
        this.fournisseurOder = new HashMap<>();
    }
    
    /**
     * cette methode retoure la liste des fournisseur
     * @return List(Supplier)
     */
    public List<Supplier> getFournisseurs() {
        return this.fournisseurs;
    }

    /**
     * cette methode retourne le dictionnaire des fournisseur et des leurs commandes
     * associes
     * @return Map(Supplier,Order) lidte 
     */
    public Map<Supplier, Order> getAssignedOrder() {
        return this.fournisseurOder;
    }

    /**
     * cette methode enregistre un supplier dans le liste des fournisseurs sinon
     * genere une
     * erreur sil est dans la liste
     * 
     * @param fournisseur fournisseur a ajoute
     * @throws MarketException erreur s'il est deja dans la liste
     */
    public void registerSupplier(Supplier fournisseur) throws MarketException {
        if (this.fournisseurs.contains(fournisseur)) {
            throw new MarketException("ce fournisseur est deja enregistre");
        } else {
            this.fournisseurs.add(fournisseur);
        }
    }

    /**
     * cette methode renvoie true si le fournisseur a deja une commande
     * 
     * @param fournisseur le fournisseur
     * @return boolean
     */
    public boolean aDejaCommande(Supplier fournisseur) {
        return this.fournisseurOder.keySet().contains(fournisseur);
    }

    /**
     * cette methode propose au fournisseur une liste de commandes
     * 
     * @param l liste commandes
     */
    public void proposeOrder(List<Order> l) {
        for (Supplier fournisseur : this.fournisseurs) {
            if (!this.aDejaCommande(fournisseur)) {
                Order accepte = fournisseur.choseOrder(l);
                if (accepte != null) {
                    l.remove(accepte);
                    this.fournisseurOder.put(fournisseur, accepte);
                }
            }
        }
    }

    /**
     * cette methode renvoie t le coût payé cumulé pour toutes les commandes qui ont
     * actuellement été choisies par un fournisseur
     * 
     * @return double
     */
    public double totalCurrentPaidCost() {
        double prix = 0;
        for (Order commandes : this.fournisseurOder.values()) {
            prix = prix + commandes.coutTotale();
        }
        return prix;
    }

    /**
     * cette methode renvoiela liste des fournisseurs actuellement sans commande
     * pour ce march
     * 
     * @return List(Supplier)
     */
    public List<Supplier> freeSuppliers() {
        List<Supplier> res = new ArrayList<>();
        for (Supplier supplier : this.fournisseurs) {
            if (!this.aDejaCommande(supplier)) {
                res.add(supplier);
            }
        }
        return res;
    }

    /**
     * cette methoe affiche les fournisseur et leur commande
     */
    public void displaySupplierOrder() {
        for (Supplier fournisseur : this.fournisseurOder.keySet()) {
            System.out.println(fournisseur.toString() + " : " + this.fournisseurOder.get(fournisseur).toString());
        }
    }

    /**
     * cette methode affiche les fournisseur du marche
     */
    public void displaySupplier() {
        for (Supplier supplier : fournisseurs) {
            System.out.println(supplier.toString());
        }
    }

    /**
     * cette methode affiche les fournisseur du marche qui nont pas de commande
     */
    public void displaySupplierFree() {
        for (Supplier supplier : this.freeSuppliers()) {
            System.out.println(supplier.toString());
        }
    }
}
