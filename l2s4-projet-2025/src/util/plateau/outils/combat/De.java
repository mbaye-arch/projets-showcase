package util.plateau.outils.combat;

import java.util.Random;
import ares.util.joueur.JoueurAres;
/**
 * Classe De qui permet de lancer un dé
 */
public class De {
    protected JoueurAres j1;
    private int nbTirages;
    private static final Random RANDOM = new Random();
    /**
     * Constructeur de la classe De qui permet de lancer un dé
     * @param j1 JoueurAres
     * @param nbTirages int
     */
    public De(JoueurAres j1,int nbTirages) {
        this.j1 = j1;
        this.nbTirages= nbTirages;       
    }
    
    /**
     * Méthode qui permet de retourner le joueur 
     * @return JoueurAres
     */
    public JoueurAres getJoueur1() {
        return this.j1;
    }
    
    /**
     * Méthode qui permet de retourner le nombre de tirages
     * @return int
     */
    public int getNbTirages() {
        return this.nbTirages;
    }
    
    /**
     * Méthode qui permet de lancer un dé
     * @return int le resultat du lancer de dé
     */
    public int lancerDes() { 
        int somme = 0;
        for (int i = 0; i < this.nbTirages; i++) {
            somme += RANDOM.nextInt(6) + 1;
        }
        return somme;
    }
  
} 