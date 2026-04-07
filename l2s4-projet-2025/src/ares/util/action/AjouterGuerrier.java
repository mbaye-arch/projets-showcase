package ares.util.action;

import ares.Ares;
import ares.util.batiment.*;
import ares.util.joueur.JoueurAres;
import java.util.*;
import util.action.Action;
import util.batiment.Batiment;
import util.joueur.Joueur;
import util.plateau.outils.ressource.Ressource;
import util.plateau.outils.tuile.Tuile;

/**
 * Classe AjouterGuerrier qui permet d'ajouter des Guerrier à une armée ou un
 * camp
 */
public class AjouterGuerrier extends Action {
    /**
     * les prérequis pour ajouter des Guerrier
     */
    private final static HashMap<Ressource, Integer> PREREQUIS = new HashMap<>();

    static {
        PREREQUIS.put(JoueurAres.GUERRIER, 1);
    }

    /**
     * Constructeur de l'action AjouterGuerrier
     */
    public AjouterGuerrier(Ares jeu) {
        super(PREREQUIS, jeu);
    }

    /**
     * Méthode qui permet de vérifier si l'objet est égale à un autre objet
     *
     * @param o l'objet à comparer
     * @return true si les objets sont égaux, false sinon
     */
    public boolean equals(Object o) {
        return o instanceof AjouterGuerrier;
    }

    /**
     * Méthode qui permet d'afficher l'action AjouterGuerrier et son prérequis
     *
     * @return le texte de l'action AjouterGuerrier
     */
    @Override
    public String toString() {
        return "Ajouter des Guerrier à une armée ou un camp " + super.displayPrerequis();
    }

    /**
     * Méthode qui permet d'ajouter des Guerrier à une armée ou un camp
     *
     * @param joueur le joueur qui effectue l'action
     * @throws Exception
     */
    @Override
    public void act(Joueur joueur) throws Exception {
        if (super.aPrerequis(joueur)) {
            System.out.println("Ajout de Guerrier à une armée ou un camp");
            System.out.println("1. Ajouter des Guerrier à une armée");
            System.out.println("2. Ajouter des Guerrier à un camp");
            System.out.print("Choisissez une option : ");
            int option = super.saisisIntIntervalle(1, 2);
            List<Tuile> tuiles = super.getJeu().getTuileType(new Armée(1, (JoueurAres) joueur), joueur);
            List<Tuile> tuilesCamp = super.getJeu().getTuileType(new Camp(0, (JoueurAres) joueur), joueur);
            if (tuiles.isEmpty() && tuilesCamp.isEmpty()) {
                System.out.println("Aucune armée ou camp à laquelle ajouter des Guerrier");
                return;
            } else {
                int nbGuerrier = 0;
                int nombreGuerrier = joueur.getRessources().get(JoueurAres.GUERRIER);
                System.out.println("Vous avez " + nombreGuerrier + " Guerrier");
                if (option == 1) {
                    if (tuiles.isEmpty()) {
                        System.out.println("Aucune armée à laquelle ajouter des Guerrier");
                        return;
                    } else {
                        System.out.println("Choisissez la tuile à laquelle ajouter des Guerrier selon l'armée");
                        for (int i = 0; i < tuiles.size(); i++) {
                            System.out.println((i + 1) + ". " + tuiles.get(i).toString() + " a la position "
                                    + tuiles.get(i).getPosition().toString());
                        }
                        System.out.print("Choisissez une tuile : ");
                        int tuile = super.saisisIntIntervalle(1, tuiles.size());
                        Tuile tuil = tuiles.get(tuile - 1);
                        System.out.println("Saisissez le nombre de Guerriers à ajouter à l'armée");
                        System.out.print("Nombre de Guerriers : ");
                        nbGuerrier = saisisIntIntervalle(1, nombreGuerrier);
                        Batiment bat = super.getJeu().getRelationTuileBatiment().get(tuil);
                        if (bat.getDimension() + nbGuerrier > 5) {
                            System.out.println("L'armée choisis vas étre modifié en camp");
                            Camp camp = new Camp(nbGuerrier + bat.getDimension(), ((JoueurAres) joueur));
                            super.getJeu().replaceBatiment(tuil, camp, joueur);
                            System.out.println(joueur.getBatiments());
                        } else {
                            ((Armée) bat).addGuerrier(nbGuerrier);
                        }
                    }
                } else if (option == 2) {
                    if (tuilesCamp.isEmpty()) {
                        System.out.println("Aucun camp auquel ajouter des Guerrier");
                        return;
                    } else {
                        System.out.println("Choisissez la tuile à laquelle ajouter des Guerrier selon le camp");
                        for (int i = 0; i < tuilesCamp.size(); i++) {
                            System.out.println((i + 1) + ". " + tuilesCamp.get(i).toString() + " a la position "
                                    + tuilesCamp.get(i).getPosition().toString());
                        }
                        System.out.print("Choisissez une tuile : ");
                        int tuile = super.saisisIntIntervalle(1, tuilesCamp.size());
                        Tuile tuil = tuilesCamp.get(tuile-1);
                        System.out.println("Saisissez le nombre de Guerriers à ajouter au camp");
                        System.out.print("Nombre de Guerriers : ");
                        nbGuerrier = super.saisisIntIntervalle(1, nombreGuerrier);
                        Batiment bat = super.getJeu().getRelationTuileBatiment().get(tuil);
                        ((Camp) bat).addGuerrier(nbGuerrier);
                        super.getJeu().replaceBatiment(tuil, bat, joueur);
                    }
                }
                joueur.addRessource(JoueurAres.GUERRIER, -nbGuerrier);;
                super.displayActionEffectue();
            }
        } else {
            super.displayNoRessource();
        }
    }
}
