package demeter.util.action;

import java.util.*;
import demeter.Demeter;
import demeter.util.batiment.Ferme;
import util.action.Construire;
import util.joueur.Joueur;
import util.plateau.outils.position.Position;
import util.plateau.outils.ressource.Ressource;
import util.plateau.outils.tuile.Tuile;
import demeter.util.joueur.JoueurDemeter;

/**
 * ConstruireFerme est une classe qui permet au joueur de construire une ferme
 * Elle hérite de la classe Action
 */
public class ConstruireFerme extends Construire {
    // Prerequis pour construire une ferme
    private final static HashMap<Ressource, Integer> PREREQUIS = new HashMap<Ressource, Integer>();

    static {
        PREREQUIS.put(Joueur.BOIS, 1);
        PREREQUIS.put(Joueur.MINERAIS, 1);
    }

    /**
     * Constructeur de ConstruireFerme
     */
    public ConstruireFerme(Demeter jeu) {
        super(PREREQUIS, jeu);
    }

    /**
     * Méthode qui permet de savoir si deux ConstruireFerme sont égaux
     *
     * @param o : l'objet à comparer
     * @return boolean : true si les deux ConstruireFerme sont égaux, false
     *         sinon
     */
    public boolean equals(Object o) {
        return o instanceof ConstruireFerme;
    }

    /**
     * Méthode qui permet d'afficher ConstruireFerme
     *
     * @return String : l'affichage de ConstruireFerme
     * @see Action#displayPrerequis()
     */
    @Override
    public String toString() {
        return "Construire une Ferme " + super.displayPrerequis();
    }

    /**
     * Méthode qui permet d'effectuer l'action ConstruireFerme
     *
     * @param joueur : le joueur qui effectue l'action
     * @throws Exception
     */
    public void act(Joueur joueur) throws Exception {
        System.out.println("Construction d'une Ferme");
        if (!super.aPrerequis(joueur)) {
            super.displayNoRessource();
            return;
        }
        Position position = super.getJeu().choisisTuile(joueur);
        if (position == null) {
            return;
        }
        Ferme ferme = new Ferme((JoueurDemeter) joueur);
        boolean fait = super.act(joueur, position, ferme);
        if (fait) {
            super.retireRessource(joueur);
            super.displayActionEffectue();
            ((JoueurDemeter) joueur).setNbPoints(1);
            if (this.getNbIleConquis(joueur) == 2) {
                ((JoueurDemeter) joueur).setNbPoints(1);
                System.out.println("vous avez gagné un point bonnus ✔️");
            } else if (this.getNbIleConquis(joueur) > 2) {
                ((JoueurDemeter) joueur).setNbPoints(2);
                System.out.println("vous avez gagné deux points bonnus ✔️");
            }
        }
    }

    /**
     * cette methode retourne le nombre de ile conquis
     * 
     * @param joueur le joueur
     * @return int le nombre d'ile conquis
     */
    public int getNbIleConquis(Joueur joueur) {
        int res = 0;
        for (int nbIle : super.getJeu().getIle().getTuiles().keySet()) {
            if (this.estCompleteIle(nbIle) && this.occupeIleTotalement(joueur, nbIle)) {
                res = res + 1;
            }
        }
        return res;
    }

    /**
     * cette methode renvoie true si un ile est occupe totalement
     * 
     * @param numIle le numero de l'ile
     * @return boelan vrai ou faux
     */
    public boolean estCompleteIle(int numIle) {
        for (Tuile tuile : super.getJeu().getIle().getTuiles().get(numIle)) {
            if (super.getJeu().getRelationTuileBatiment().get(tuile) == null) {
                return false;
            }
        }
        return true;
    }

    /**
     * cette methode renvoie vrai si un joueur occupe une ile totalement
     * 
     * @param joueur le joueur
     * @param nbIle  le numero de l'il'
     * @return vrai ou faux si cest le cas
     */
    public boolean occupeIleTotalement(Joueur joueur, int nbIle) {
        for (Tuile tuile : super.getJeu().getIle().getTuiles().get(nbIle)) {
            if (!(super.getJeu().getRelationTuileBatiment().get(tuile).getProprietaire().equals(joueur))) {
                return false;
            }
        }
        return true;
    }
}
