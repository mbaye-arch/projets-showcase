package market;

import market.supplier.*;
import market.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Classe de test pour Market
 */
public class TestMarket {

    private Market market;
    private Supplier supplier1;
    private Supplier supplier2;
    private Supplier supplier3;
    private List<Order> commandes;

    @BeforeEach
    public void setUp() {
        market = new Market();
        supplier1 = new SupplierUrgence("Supplier1", 10, 5.0);
        supplier2 = new SupplierUrgence("Supplier2", 15, 7.0);
        supplier3 = new SupplierUrgenceReputation("Supplier3", 20, 6.0, 2);
        commandes = new ArrayList<>();
        commandes.add(new Order(8, 10, 10.0)); 
        commandes.add(new Order(15, 5, 8.0)); 
        commandes.add(new Order(18, 20, 15.0)); 
    }

    @Test
    public void testMarketCreation() {
        assertTrue(market.getFournisseurs().isEmpty());
        assertTrue(market.getAssignedOrder().isEmpty());
    }

    @Test
    public void testRegisterSupplier() throws MarketException {
        market.registerSupplier(supplier1);
        assertEquals(1, market.getFournisseurs().size());
        market.registerSupplier(supplier2);
        assertEquals(2, market.getFournisseurs().size());
        Exception exception = assertThrows(MarketException.class, () -> market.registerSupplier(supplier1));
        assertEquals("ce fournisseur est deja enregistre", exception.getMessage());
    }

    @Test
    public void testProposeOrder() throws MarketException {
        market.registerSupplier(supplier1);
        market.registerSupplier(supplier2);
        market.registerSupplier(supplier3);
        market.proposeOrder(commandes);
        assertEquals(3, market.getAssignedOrder().size());
        assertEquals(8, market.getAssignedOrder().get(supplier1).getMinQuality());
        assertEquals(15, market.getAssignedOrder().get(supplier2).getMinQuality());
        assertEquals(18, market.getAssignedOrder().get(supplier3).getMinQuality());
        assertTrue(commandes.isEmpty());
    }

    @Test
    public void testFreeSuppliers() throws MarketException {
        market.registerSupplier(supplier1);
        market.registerSupplier(supplier2);
        assertEquals(2, market.freeSuppliers().size());
        market.proposeOrder(commandes);
        assertEquals(0, market.freeSuppliers().size());
    }

    @Test
    public void testTotalCurrentPaidCost() throws MarketException {
        market.registerSupplier(supplier1);
        market.registerSupplier(supplier2);
        market.proposeOrder(commandes); 
        assertEquals(140.0, market.totalCurrentPaidCost());
    }

    @Test
    public void testDisplaySupplierOrder() throws MarketException {
        market.registerSupplier(supplier1);
        market.registerSupplier(supplier2);
        market.proposeOrder(commandes);
        market.displaySupplierOrder(); 
    }
}
