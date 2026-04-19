package market.supplier;

import java.util.ArrayList;
import java.util.List;
import market.*;


/**
 * cette classe abstarite represente un fournisseur 
 */
public abstract class Supplier{
    protected String nom;
    protected int niveauQualite;
    protected double coutUnitaire;
    /**
     * constructeur de la classe abstraite 
     * @param nom nom du fournisseur
     * @param niveauQualite niveau qualite requis 
     * @param coutUnitaire cout unitaire de sa production
     */
    public Supplier(String nom,int niveauQualite,double coutUnitaire){
        this.nom=nom;
        this.niveauQualite=niveauQualite;
        this.coutUnitaire=coutUnitaire;
    }
    /**
     * cette methode renvoie le nom du fournisseur
     * @return nom nom du fournisseur
     */
    public String getNom(){
        return this.nom;
    }
    /**
     * cette methode retourne le niveua de qualite requis pour un fournisseur 
     * @return niveauQualite 
     */
    public int getNiveauQualite(){
        return this.niveauQualite;
    }

    /**
     * cette methode retourne le cout unitaire de production
     * @return coutUnitaire
     */
    public double getCoutUnitaire(){
        return this.coutUnitaire;
    }

    /**
     * cette methode prend une liste de commandes et 
     * retourne la liste de commande que pourrais accepter
     * le fournisseur 
     * @param commandes liste de commandes 
     * @return List(Order) liste des commandes accepatbles
     */
    public List<Order> getOrderAccept(List<Order> commandes){
        List<Order> res= new ArrayList<>();
        for (Order order : commandes) {
            if (this.canAccept(order)){
                res.add(order);
            }
        }
        return res;
    }

    /**
     * cette retourne la commande accepte par le fournisseur 
     * @param l la liste de commande
     * @return Order la commande accepte 
     */
    public abstract Order choseOrder(List<Order> l);

    /**
     * cette methode dit si une commande est accepatble ou pas 
     * @param commande la commande a valider
     * @return boolean true ou false
     */
    public boolean canAccept(Order commande){
        return this.niveauQualite>=commande.getMinQuality()&& 
        this.coutUnitaire * commande.getQuantity() < commande.coutTotale();

    }

    /**
     * cette methode donne le cout de production totale 
     * pour une commande selon le fournisseur
     * @param commande la commande dont on veux le prix de production
     * @return double le prix tottale de production
     */
    public double coutProduction(Order commande){
        return this.coutUnitaire*commande.getQuantity();
    }

    /**
     * cette methode fait une description du fournisseur
     * @return String  
     */
    public String toString(){
        return this.nom+" ; "+this.niveauQualite+" ; "+this.coutUnitaire;
    }

    /**
     * cette methode dit si un fournisseur est egal a une autre 
     * @return boolean 
     */
    public boolean equals(Object o){
        if(!(o instanceof Supplier)){
            return false;
        }
        else{
            Supplier other = (Supplier) o;
            return this.nom.equals(other.nom)&&this.coutUnitaire==other.coutUnitaire&&this.niveauQualite==other.niveauQualite;
        }
    }

    public int hashcode(){
        return this.nom.hashCode();
    }
    
}