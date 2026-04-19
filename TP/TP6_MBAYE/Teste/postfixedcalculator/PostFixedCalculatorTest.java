package Teste.postfixedcalculator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import postfixedcalculator.PostFixedCalculator;

import static org.junit.jupiter.api.Assertions.*;
import calc.gui.*;
public class PostFixedCalculatorTest {

    private PostFixedCalculator calculator;

    @BeforeEach
    public void setUp() {
        calculator = new PostFixedCalculator();
        CalculatorView infixe=new CalculatorView(calculator);
        infixe.run();
    }

    @Test
    public void testInitialValue() {
        assertEquals(0, calculator.getCurrentValue(), "La valeur initiale doit être 0.");
    }

    @Test
    public void testPressDigit() {
        calculator.pressDigit(3);
        assertEquals(3, calculator.getCurrentValue(), "La valeur courante doit être 3 après avoir appuyé sur 3.");
        
        calculator.pressDigit(5);
        assertEquals(35, calculator.getCurrentValue(), "La valeur courante doit être 35 après avoir appuyé sur 5.");
    }

    @Test
    public void testAddition() {
        calculator.pressDigit(4);
        calculator.pressEquals();
        calculator.pressDigit(6);
        calculator.pressPlus();
        assertEquals(10, calculator.getCurrentValue(), "4=6+ doit donner 10.");
    }

    @Test
    public void testSubtraction() {
        calculator.pressDigit(9);
        calculator.pressEquals();
        calculator.pressDigit(3);
        calculator.pressMinus();
        assertEquals(6, calculator.getCurrentValue(), "9=3- doit donner 6.");
    }

    @Test
    public void testMultiplication() {
        calculator.pressDigit(7);
        calculator.pressEquals();
        calculator.pressDigit(3);
        calculator.pressMult();
        assertEquals(21, calculator.getCurrentValue(), "7=3* doit donner 21.");
    }

    @Test
    public void testDivision() {
        calculator.pressDigit(8);
        calculator.pressEquals();
        calculator.pressDigit(2);
        calculator.pressDiv();
        assertEquals(4, calculator.getCurrentValue(), "8=2/ doit donner 4.");
    }

    @Test
    public void testModulo() {
        calculator.pressDigit(10);
        calculator.pressEquals();
        calculator.pressDigit(3);
        calculator.pressSuprise();
        assertEquals(1, calculator.getCurrentValue(), "10=3% doit donner 1.");
    }

    @Test
    public void testPressClear() {
        calculator.pressDigit(5);
        calculator.pressPlus();
        calculator.pressDigit(3);
        calculator.pressEquals();
        calculator.pressClear();
        assertEquals(0, calculator.getCurrentValue(), "Après une réinitialisation, la valeur courante doit être 0.");
    }

    @Test
    public void testPressDel() {
        calculator.pressDigit(9);
        calculator.pressDigit(8);
        calculator.pressDel();
        assertEquals(9, calculator.getCurrentValue(), "Suppression du dernier chiffre de 98 doit donner 9.");
    }

    @Test
    public void testPressEquals() {
        calculator.pressDigit(4);
        calculator.pressEquals();
        assertEquals(0, calculator.getCurrentValue(), "La valeur passe a 0");
        calculator.pressDigit(0);   
        calculator.pressDiv();
        assertEquals(calculator.getCurrentValue(), 888888888,"la valeur courante est egale a  8888888888");
    }
}
