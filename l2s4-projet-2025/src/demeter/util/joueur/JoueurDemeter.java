package demeter.util.joueur;

import demeter.util.ressource.Voleur;
import util.batiment.Batiment;
import util.batiment.Port;
import util.joueur.Joueur;

/**
 * cette classe represente un joueurDemeter
 */
public class JoueurDemeter extends Joueur {
    public static final Voleur VOLEUR = new Voleur();
    private int nbPoints;

    /**
     * contructeur de la classe JoueurDemeter
     * 
     * @param name le nom du joueur
     */
    public JoueurDemeter(String name) {
        super(name);
        super.getRessources().put(JoueurDemeter.VOLEUR, 1);
        this.nbPoints = 0;
    }

    /**
     * cette methode retourne le stock de voleurs du joueur
     * 
     * @return int le stock
     */
    public int getStockVoleur() {
        return super.getRessources().get(JoueurDemeter.VOLEUR);
    }

    /**
     * cette methode retourne le nombre de points du joueur
     * 
     * @return int le nombre de points
     */
    public int getNbPoints() {
        return this.nbPoints;
    }

    /**
     * cette methode permet d'ajouter des points au joueur
     * 
     * @param n le nombre de points a ajouter
     * @return void
     */
    public void setNbPoints(int n) {
        this.nbPoints = this.nbPoints + n;
    }

    /**
     * surcharge de la methode display pour afficher les points du joueur
     */
    public void display() {
        super.display();
        System.out.println("Points: " + this.nbPoints);
    }
    
    /**
     * @return true si le joueur a un port
     */
    public boolean aUnPort() {
        // Implémentation pour vérifier si le joueur possède un port
        // Par exemple, vérifier si le joueur a un bâtiment de type "Port" dans sa liste de bâtiments
        for (Batiment bat  : this.getBatiments()) {
            if (bat instanceof Port) {
                return true;
            }
        }
        return false;
    }
}
