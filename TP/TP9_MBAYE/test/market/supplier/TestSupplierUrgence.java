package market.supplier;

import market.Order;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Classe de test pour SupplierUrgence
 */
public class TestSupplierUrgence {

    private SupplierUrgence supplier;
    private List<Order> commandes;

    @BeforeEach
    public void setUp() {
        supplier = new SupplierUrgence("UrgentSupplier", 10, 5.0);
        commandes = new ArrayList<>();
        commandes.add(new Order(8, 10, 10.0)); 
        commandes.add(new Order(12, 10, 10.0)); 
        commandes.add(new Order(10, 5, 8.0)); 
        commandes.add(new Order(10, 20, 15.0)); 
    }

    @Test
    public void testSupplierUrgenceCreation() {
        assertEquals("UrgentSupplier", supplier.getNom());
        assertEquals(10, supplier.getNiveauQualite());
        assertEquals(5.0, supplier.getCoutUnitaire());
    }

    @Test
    public void testChoseOrderPrioritaire() {
        Order chosenOrder = supplier.choseOrder(commandes);
        assertNotNull(chosenOrder);
        assertEquals(8, chosenOrder.getMinQuality()); 
    }

    @Test
    public void testNoAcceptableOrders() {
        commandes.clear();
        commandes.add(new Order(7, 10, 5.0)); 
        commandes.add(new Order(1, 10, 2.0)); 

        Order chosenOrder = supplier.choseOrder(commandes);
        assertNull(chosenOrder); 
    }

    @Test
    public void testOnlyOneAcceptableOrder() {
        commandes.clear();
        commandes.add(new Order(8, 5, 10.0)); 
        Order chosenOrder = supplier.choseOrder(commandes);
        assertNotNull(chosenOrder);
        assertEquals(8, chosenOrder.getMinQuality());
        assertEquals(5, chosenOrder.getQuantity());
    }
}
