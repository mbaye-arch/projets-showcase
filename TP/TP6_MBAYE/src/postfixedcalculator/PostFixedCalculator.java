package postfixedcalculator;

import java.util.*;
import util.*;

import calc.*;

/**
 * La classe PostFixedCalculator implémente une calculatrice
 * postfixée utilisant une pile pour stocker les valeurs et appliquer les
 * opérations.
 */
public class PostFixedCalculator implements Calculator {
    private final int MAXERRORVALUE=888888888;
    private Stack<Integer> pile = new Stack<Integer>();
    private int valeurCourante;

    /**
     * Constructeur de PostFixedCalculator. Initialise la pile avec une valeur de 0.
     */
    public PostFixedCalculator() {
        this.pile.push(0);
    }

    /**
     * Retourne la valeur courante au sommet de la pile.
     *
     * @return La valeur entière actuelle.
     */
    @Override
    public int getCurrentValue() {
        return this.pile.peek();
    }

    /**
     * Ajoute un chiffre à la valeur courante. S'il y a déjà un nombre, il concatène
     * le chiffre à la fin.
     *
     * @param digit Le chiffre à ajouter.
     */
    @Override
    public void pressDigit(int digit) {
        if (this.pile.peek() == null) {
            this.pile.add(digit);
        } else {
            Integer n = this.pile.pop();
            n = n * 10 + digit;
            this.pile.push(n);
        }
    }

    /**
     * Applique un opérateur donné aux deux valeurs au sommet de la pile.
     *
     * @param op L'opérateur à appliquer.
     */
    public void pressOperateur(Operateur op) {
        if (this.pile.size() >= 2) {
            try{
            Integer val1 = this.pile.pop();
            Integer val2 = this.pile.pop();
            Integer val = op.compute(val2, val1);
            this.pile.push(val);
            }
            catch(ArithmeticException e){
                this.pile.push(MAXERRORVALUE);
            }
        } else {
            this.pile.push(0);
        }
    }

    /**
     * Applique l'opération d'addition.
     */
    @Override
    public void pressPlus() {
        this.pressOperateur(new Addition());
    }

    /**
     * Applique l'opération de soustraction.
     */
    @Override
    public void pressMinus() {
        this.pressOperateur(new Soustraction());

    }

    /**
     * Applique l'opération de division
     */
    @Override
    public void pressDiv() {
        this.pressOperateur(new Division());

    }

    /**
     * Applique l'opération de multiplication.
     */
    @Override
    public void pressMult() {
        this.pressOperateur(new Multiplication());

    }

    /**
     * Réinitialise la calculatrice en poussant 0 dans la pile.
     */
    @Override
    public void pressEquals() {
        this.pile.push(0);
    }

    /**
     * Supprime le dernier chiffre ajouté dans la valeur courante.
     */
    @Override
    public void pressDel() {
        if (!this.pile.isEmpty()) {
            Integer n = this.pile.pop();
            n = n / 10;
            this.pile.push(n);
        }
    }

    /**
     * Efface la pile et réinitialise la calculatrice.
     */
    @Override
    public void pressClear() {
        this.pile = new Stack<Integer>();
        this.valeurCourante = 0;
        this.pile.push(0);
    }

    /**
     * Applique l'opération de modulo.
     */
    @Override
    public void pressSuprise() {
        this.pressOperateur(new Modulo());

    }
}
