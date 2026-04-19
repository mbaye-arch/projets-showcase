package infixedcalculator;

import calc.Calculator;
import util.*;

/**
 * Class infixedCalculator
 * qui represente la calculatrice infixe qui est sur le jar calcualtor-V2.jar
 * et implemente Calculator
 */
public class InfixedCalculator implements Calculator {
    private final int MAXVALUEERROR=888888888;
    private int valeurCourant;
    // utilisation d'une liste
    private int[] liste = { 0, 0 };
    private boolean egalAppuye;
    private Operateur operateur;

    /**
     * constructeur de la classe sans aucun parametre et donne une calculateur
     */
    public InfixedCalculator() {
        this.valeurCourant = 0;
        this.egalAppuye = false;
        this.operateur = null;
    }

    /**
     * donne la valeur de egal appuye
     * 
     * @return boolean donne un boolean
     */
    public boolean getEgal() {
        return this.egalAppuye;
    }

    /**
     * methode de pour obtenir la valeur courante
     * 
     * @return valeurCourante
     */
    @Override
    public int getCurrentValue() {
        return this.valeurCourant;
    }

    /**
     * methode press digit qui gère un clic sur une valeur
     */
    @Override
    public void pressDigit(int digit) {
        if (this.operateur == null) {
            this.valeurCourant = liste[0];
            this.liste[0] = this.liste[0] * 10 + digit;
            this.valeurCourant = liste[0];
        } else if (this.operateur != null) {
            this.liste[1] = this.liste[1] * 10 + digit;
            this.valeurCourant = this.liste[1];
        }
    }

    /**
     * methode qui gere le clic sur le bouton plus
     */
    @Override
    public void pressPlus() {
        this.pressOperateur(new Addition());
    }

    /**
     * méthode qui gere le clic sur le bouton moins
     */
    @Override
    public void pressMinus() {
        this.pressOperateur(new Soustraction());
    }

    /**
     * methode qui gere le clic sur le bouton division
     */
    @Override
    public void pressDiv() {
        this.pressOperateur(new Division());
    }

    /**
     * cette methode gere lappuie sur un operateur
     * 
     * @param op operateur en parametre
     */
    public void pressOperateur(Operateur op) {
        if (this.operateur != null) {
            this.pressEquals();
            this.egalAppuye=false;

        }
        this.operateur = op;
        this.pressEquals();

    }

    /**
     * methode qui gere le clic sur le bouton multiplication
     */
    @Override
    public void pressMult() {
        this.pressOperateur(new Multiplication());

    }

    /**
     * methode qui est appliquee lorsqu'on clic sur egale
     */
    public void pressEquals() {
        if (this.operateur != null) {
            try {
                this.valeurCourant = this.operateur.compute(this.liste[0], this.liste[1]);
                this.egalAppuye = true;
                this.liste[0] = this.valeurCourant;
                this.liste[1] = 0;
            } catch (ArithmeticException e) {
                this.valeurCourant=MAXVALUEERROR;
            }
        }
    }

    /**
     * methode qui est appliquée lorsqu'on clique sur del
     * cela permet de supprimer la dernière valeur
     */
    @Override
    public void pressDel() {
        if (this.valeurCourant == this.liste[0]) {
            this.liste[0] = this.liste[0] / 10;
            this.valeurCourant = this.liste[0];
        } else {
            this.liste[1] = this.liste[1] / 10;
            this.valeurCourant = this.liste[1];
        }
    }

    /**
     * methode qui gere le clic sur le bouton surprise pour le calcul de modulo
     */
    @Override
    public void pressSuprise() {
        this.pressOperateur(new Modulo());
    }

    /**
     * methode permettant de faire une suppression complete
     * en remettant à l'initial la calculatrice
     */
    @Override
    public void pressClear() {
        int[] l1 = { 0, 0 };
        this.liste = l1;
        this.valeurCourant = 0;
        this.egalAppuye = false;
        this.operateur = null;

    }
}
