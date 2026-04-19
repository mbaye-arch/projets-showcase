package postfixedcalculator;

import calc.gui.CalculatorView;

/**
 * class pour le main
 */
public class PostFixedMain {
    /**
     * le main
     * 
     * @param args ne prend aucune argument
     */
    public static void main(String[] args) {
        PostFixedCalculator calc = new PostFixedCalculator();
        CalculatorView postFixe = new CalculatorView(calc);
        postFixe.run();
    }
}
