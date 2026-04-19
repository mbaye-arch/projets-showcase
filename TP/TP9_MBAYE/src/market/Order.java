package market;

/**
 * A class to model order minimum quality, a price and a cost.
 */
public class Order {

   private int minQuality;
   private int quantity;
   private double paidCost;
   private String id;
   private static int counter = 0;
   private static final String ORDER_ID_PREFIX = "ORDER_";

   /**
    * create en order with minimum quality, price and cost. A unique id is
    * associated to this order
    * 
    * @param minQuality minimum production quality required for this order supplier
    * @param qty  this order quantity
    * @param cost this order cost
    */
   public Order(int minQuality, int qty, double cost) {
      this.minQuality = minQuality;
      this.quantity = qty;
      this.paidCost = cost;
      this.id = ORDER_ID_PREFIX + (Order.counter++);
   }

   /**
    * return minimum production quality required for this order supplier
    * 
    * @return minimum production quality required for this order supplier
    */
   public int getMinQuality() {
      return this.minQuality;
   }

   /**
    * return this order quantity
    * 
    * @return this order quantity
    */
   public int getQuantity() {
      return this.quantity;
   }

   /**
    * return this order cost
    * 
    * @return this order cost
    */
   public double getPaidCost() {
      return this.paidCost;
   }

   /**
    * return this order id
    * 
    * @return this order id
    */
   public String getId() {
      return this.id;
   }

   /** two orders are equals if they have same id
    * @param o the other object 
    * @return return true if o is an order with same id
    */
   public boolean equals(Object o) {
      if (!(o instanceof Order))
         return false;
      Order other = (Order) o;
      return other.getId().equals(this.getId());
   }

   /**
    * cette methode calcule le cout globale de la commande 
    * @return double prix totale
    */
   public double coutTotale(){
      return this.paidCost*this.quantity;
   }

   public String toString(){
      return this.id +" ; "+this.minQuality+" ; "+this.coutTotale();
   }
}
