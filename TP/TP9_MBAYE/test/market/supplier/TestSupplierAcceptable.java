package market.supplier;

import market.Order;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Classe de test pour SupplierAcceptable
 */
public class TestSupplierAcceptable {

    private SupplierAcceptable supplier;
    private List<Order> commandes;

    @BeforeEach
    public void setUp() {
        supplier = new SupplierAcceptable("Supplier1", 10, 5.0);
        commandes = new ArrayList<>();
        commandes.add(new Order(8, 10, 10.0)); 
        commandes.add(new Order(12, 10, 10.0));
        commandes.add(new Order(10, 5, 8.0)); 
        commandes.add(new Order(10, 20, 15.0)); 
    }

    @Test
    public void testSupplierAcceptableCreation() {
        assertEquals("Supplier1", supplier.getNom());
        assertEquals(10, supplier.getNiveauQualite());
        assertEquals(5.0, supplier.getCoutUnitaire());
    }

    @Test
    public void testCanAccept() {
        Order acceptableOrder = commandes.get(0); 
        Order unacceptableOrderQuality = commandes.get(1); 
        assertTrue(supplier.canAccept(acceptableOrder));
        assertFalse(supplier.canAccept(unacceptableOrderQuality));
    }

    @Test
    public void testChoseOrder() {
        Order chosenOrder = supplier.choseOrder(commandes);
        assertNotNull(chosenOrder);
        assertEquals(20, chosenOrder.getQuantity());
        assertEquals(10, chosenOrder.getMinQuality());
    }

    @Test
    public void testNoAcceptableOrder() {
        commandes.clear();
        commandes.add(new Order(15, 10, 5.0)); 
        Order chosenOrder = supplier.choseOrder(commandes);
        assertNull(chosenOrder); 
    }

    @Test
    public void testMaxMargeWithEqualMargins() {
        commandes.add(new Order(10, 20, 15.0)); 
        Order chosenOrder = supplier.choseOrder(commandes);
        assertNotNull(chosenOrder);
        assertEquals(20, chosenOrder.getQuantity()); 
    }
}
