package market;

import java.util.*;

public class OrderGenerator {

    private static final Random ALEA = new Random();

    private static final int QUALITY_LOWER_BOUND = 1;
    private static final int QUALITY_UPPER_BOUND = 8;    
    private static final int QUANTITY_LOWER_BOUND = 10;
    private static final int QUANTITY_UPPER_BOUND = 100;    
    private static final int COST_LOWER_BOUND = 100;
    private static final int COST_UPPER_BOUND = 2000;

    /** create a list of randomly created order, orders are sorted by decreasing priority.
     * @param size size of the created order list
     * @return a sorted by decreasing prioriy list of orders
     */
    public List<Order> sortedByDecreasingPriorityOrders(int size) {
        List<Order> result = new ArrayList<>();
        for (int i = 0; i < size; i ++ ) {
            result.add(OrderGenerator.generateRandomOrder());
        }
        return result;
    }

    /**
     * randomly create an order
     * @return a randomly created order
     */
    public static Order generateRandomOrder() {
        int minQuality = QUALITY_LOWER_BOUND + ALEA.nextInt(QUALITY_UPPER_BOUND - QUALITY_LOWER_BOUND);
        int quantity = QUANTITY_LOWER_BOUND + ALEA.nextInt(QUANTITY_UPPER_BOUND - QUANTITY_LOWER_BOUND);
        double cost =  COST_LOWER_BOUND + ALEA.nextInt((COST_UPPER_BOUND - COST_LOWER_BOUND));
        return new Order(minQuality, quantity, cost);
    }

}
