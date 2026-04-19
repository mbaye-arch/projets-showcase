package infixedcalculator;
import calc.gui.CalculatorView;
/**
 * classe Main pour tester la classe InfixedCalculator
 */
public class InfixedMain {
    
    /**
     * programme main 
     * @param args pas dargument en parametre 
     */
    public static void main(String[] args) {
        InfixedCalculator calc = new InfixedCalculator(); //initialisation du calc
        CalculatorView infixe = new CalculatorView(calc); //creation de linterface 
        infixe.run();
        
    }
}
