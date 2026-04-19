package market;


import market.supplier.*;

public class MarketMain {
    public static void main(String[] args) {
        SupplierAcceptable fournisseur1 =new SupplierAcceptable("1", 5, 500);
        SupplierUrgence fournisseur2= new SupplierUrgence("2", 5, 1000);
        SupplierUrgenceReputation fournisseur3= new SupplierUrgenceReputation("3", 4, 100, 6);
        SupplierAcceptable fournisseur4 =new SupplierAcceptable("4", 9, 510);
        SupplierUrgence fournisseur5= new SupplierUrgence("5", 3, 140);
        SupplierUrgenceReputation fournisseur6= new SupplierUrgenceReputation("6", 4, 1450, 8);
        SupplierAcceptable fournisseur7 =new SupplierAcceptable("7", 2, 1500);
        SupplierUrgence fournisseur8= new SupplierUrgence("8", 4, 2000);
        SupplierUrgenceReputation fournisseur9= new SupplierUrgenceReputation("9", 4, 300, 5);
        SupplierUrgence fournisseur10= new SupplierUrgence("10", 9, 5000);
        Market marche = new Market();
        marche.getFournisseurs().add(fournisseur1);
        marche.getFournisseurs().add(fournisseur2);
        marche.getFournisseurs().add(fournisseur3);
        marche.getFournisseurs().add(fournisseur4);
        marche.getFournisseurs().add(fournisseur5);
        marche.getFournisseurs().add(fournisseur6);
        marche.getFournisseurs().add(fournisseur7);
        marche.getFournisseurs().add(fournisseur8);
        marche.getFournisseurs().add(fournisseur9);
        marche.getFournisseurs().add(fournisseur10);
        OrderGenerator listeCommande = new OrderGenerator();
        marche.proposeOrder(listeCommande.sortedByDecreasingPriorityOrders(10));
        marche.displaySupplierOrder();
        System.out.println(marche.totalCurrentPaidCost());
        for (Supplier fournisseur : marche.freeSuppliers()) {
            System.out.println(fournisseur.toString());
        }
    }
}
