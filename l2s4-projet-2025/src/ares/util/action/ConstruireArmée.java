package ares.util.action;

import util.action.Construire;

import ares.Ares;
import ares.util.batiment.Armée;
import ares.util.joueur.JoueurAres;
import java.util.*;
import util.batiment.Batiment;
import util.joueur.Joueur;
import util.plateau.outils.position.Position;
import util.plateau.outils.ressource.*;

/**
 * ConstruireArmée est une classe qui permet de construire une armée dans une
 * ile
 * Cette classe herite de la classe Action
 */
public class ConstruireArmée extends Construire {
    // ressources necessaires pour construire une armée
    private final static HashMap<Ressource, Integer> PREREQUIS = new HashMap<>();

    static {
        PREREQUIS.put(Joueur.BOIS, 1);
        PREREQUIS.put(Joueur.MOUTON, 1);
        PREREQUIS.put(Joueur.BLE, 1);
    }

    /**
     * Constructeur de la classe ConstruireArmée
     * 
     * @param jeu : jeu en cours
     */
    public ConstruireArmée(Ares jeu) {
        super(PREREQUIS, jeu);
    }

    /**
     * Methode equals de la classe ConstruireArmée
     * 
     * @param o : objet a comparer
     * @return : true si l'objet est une instance de ConstruireArmée
     */
    @Override
    public boolean equals(Object o) {
        return o instanceof ConstruireArmée;
    }

    /**
     * Methode toString de la classe ConstruireArmée
     * 
     * @return : une chaine de caractere
     */
    @Override
    public String toString() {
        return "Construire une armée " + super.displayPrerequis();
    }

    /**
     * Methode act de la classe ConstruireArmée
     * 
     * @param joueur : joueur qui effectue l'action
     * @throws Exception : Exception
     *                   Cette methode permet de construire une armée dans une ile
     */
    @Override
    public void act(Joueur joueur) throws Exception {
        if (!(super.aPrerequis(joueur)) || joueur.getRessources().get(JoueurAres.GUERRIER) < 1) {
            super.displayNoRessource();
            return;
        }
        System.out.println("Construction d'une Armée");
        // si le joueur dispose des ressources necessaires
        Position positionChoisi = super.getJeu().choisisTuile(joueur);
        if (positionChoisi == null) {
            return;
        }
        // on regarde lile ou se trouve cette position est bien occuper par le joueur
        Joueur occupant = super.getJeu().occupeIle(positionChoisi);
        int maxGuerrierDispo = joueur.getRessources().get(JoueurAres.GUERRIER);
        System.out.println("Saisis nombre de guerrier compris entre 1 et 5");
        int nbGuerrier = super.saisisIntIntervalle(1, Math.min(5, maxGuerrierDispo));
        Batiment batimentc = new Armée(nbGuerrier, (JoueurAres) joueur);
        // personne n'occupe l'ile on peut ajouter l'armee ou occupant est le joueur
        // on construit l'armée
        boolean result = false;
        if (occupant == null || occupant.equals(joueur)) {
            result = super.act(joueur, positionChoisi, batimentc);
            if(result){
            joueur.addRessource(JoueurAres.GUERRIER, -nbGuerrier);
            super.retireRessource(joueur);
            }

        } // si le joueur occupe l'ile
        else {
            System.out.println("cette ile n'est pas a vous");
            System.out.println("Le proprio de cette ile est " + occupant.toString());
            List<Integer> iles = super.getJeu().getIlesOccupeJoueur(joueur);
            // s'il a au moins une ile conquis
            if (iles.isEmpty()) {
                System.out.println("vous ne pouvez pas construire d'armée car vous n'avez conquis aucune ile!!");
                System.out.println("Action non effectué");
                return;
            } else {
                int cpt = 0;
                for (Integer integer : iles) {
                    if (super.getJeu().hasPort(joueur, integer)) {
                        if (super.getJeu().hasDeuxBatiment(joueur, integer)) {
                            cpt = cpt + 1;
                        }
                    }
                }
                if (cpt == iles.size()) {
                    System.out.println("Vous avez un port et deux batiment sur les iles que vous occupez");
                    result = super.act(joueur, positionChoisi, batimentc);
                    if(result){
                        joueur.addRessource(JoueurAres.GUERRIER, -nbGuerrier);
                        super.retireRessource(joueur);
                        }
                } else {
                    super.regleArméePort();
                }
            }
        }
    }

}
