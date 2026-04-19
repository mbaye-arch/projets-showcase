package market.supplier;

import market.Order;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Classe de test pour SupplierUrgenceReputation
 */
public class TestSupplierUrgenceReputation {

    private SupplierUrgenceReputation supplier;
    private List<Order> commandes;

    @BeforeEach
    public void setUp() {
      
        supplier = new SupplierUrgenceReputation("ReputableSupplier", 15, 5.0, 3);
        commandes = new ArrayList<>();
        commandes.add(new Order(10, 10, 10.0)); 
        commandes.add(new Order(13, 5, 8.0));  
        commandes.add(new Order(12, 20, 15.0)); 
        commandes.add(new Order(14, 10, 12.0));
    }

    @Test
    public void testSupplierUrgenceReputationCreation() {
        assertEquals("ReputableSupplier", supplier.getNom());
        assertEquals(15, supplier.getNiveauQualite());
        assertEquals(5.0, supplier.getCoutUnitaire());
    }

    @Test
    public void testChoseOrderWithReputation() {
        Order chosenOrder = supplier.choseOrder(commandes);
        assertNotNull(chosenOrder);
        assertEquals(14, chosenOrder.getMinQuality());
    }

    @Test
    public void testNoAcceptableOrders() {
        commandes.clear();
        commandes.add(new Order(100, 10, 10.0)); 
        commandes.add(new Order(120, 10, 8.0)); 
        Order chosenOrder = supplier.choseOrder(commandes);
        assertNull(chosenOrder); 
    }

    @Test
    public void testEquality() {
        SupplierUrgenceReputation supplier1 = new SupplierUrgenceReputation("ReputableSupplier", 15, 5.0, 3);
        SupplierUrgenceReputation supplier2 = new SupplierUrgenceReputation("ReputableSupplier", 15, 5.0, 3);
        SupplierUrgenceReputation supplier3 = new SupplierUrgenceReputation("ReputableSupplier", 15, 5.0, 5);
        assertEquals(supplier1, supplier2);
        assertNotEquals(supplier1, supplier3);
    }
}
