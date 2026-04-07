package util.action;

import ares.Ares;
import demeter.Demeter;
import demeter.util.joueur.JoueurDemeter;

import java.util.*;
import util.batiment.Port;
import util.jeu.Jeu;
import util.joueur.Joueur;
import util.plateau.outils.position.Position;
import util.plateau.outils.ressource.Ressource;

public class ConstruirePort extends Construire {
    /**
     * Les ressources necessaires pour construire un port
     */
    private final static HashMap<Ressource, Integer> PREREQUIS = new HashMap<>();
    static {
        PREREQUIS.put(Joueur.BOIS, 1);
        PREREQUIS.put(Joueur.MOUTON, 2);
    }

    /**
     * Constructeur de la classe ConstruirePort
     * 
     * @param jeu le jeu dans lequel l'action est effectuee
     */
    public ConstruirePort(Jeu jeu) {
        super(PREREQUIS, jeu);
    }

    /**
     * cette methode permet de verifier si l'objet en parametre est une instance de
     * ConstruirePort
     * 
     * @param o l'objet a verifier
     * @return boolean true si l'objet est une instance de ConstruirePort
     */
    public boolean equals(Object o) {
        return o instanceof ConstruirePort;
    }

    /**
     * cette methode permet de retourner une chaine de caractere representant
     * l'action et son prerequis
     * 
     * @return String une chaine de caractere representant l'action
     */
    public String toString() {
        return "Construire un port " + super.displayPrerequis();
    }

    /**
     * cette methode permet de construire un port pour le joueur en parametre
     * 
     * @param joueur le joueur qui construit le port
     */
    public void act(Joueur joueur) throws Exception {
        System.out.println("Construction d'un port");
        // si le joueur dispose des ressources necessaires
        if (!(super.aPrerequis(joueur))){
            super.displayNoRessource();
            return;
        }
        if (super.getJeu() instanceof Ares) {
            Position positionChoisi = super.getJeu().choisisTuile(joueur);
            if (positionChoisi == null) {
                return;
            }
            while (!(super.getJeu().getPositionsVideVoisinsMer().contains(positionChoisi))) {
                System.out.println(positionChoisi.toString() + " la tuile choisie nest pas voisine de mer");
                positionChoisi = super.getJeu().choisisTuile(joueur);
                if (positionChoisi == null) {
                    return;
                }
            }
            // on regarde lile ou se trouve cette position est bien occuper par le joueur
            Joueur occupant = super.getJeu().occupeIle(positionChoisi);
            // personne n'occupe l'ile on peut ajouter le port
            Port batiment = new Port(joueur);
            if (occupant == null || occupant.equals(joueur)) {
                super.act(joueur, positionChoisi, batiment);
            }
            // cas ou il nest pas le proprio de cette ile
            else {
                System.out.println("cette ile n'est pas a vous");
                System.out.println("Le proprio de cette ile est " + occupant.toString());
                List<Integer> iles = super.getJeu().getIlesOccupeJoueur(joueur);
                // s'il a au moins une ile conquis
                if (iles.isEmpty()) {
                    System.out.println("vous ne pouvez pas construire de port car vous n'avez conquis aucune ile!!");
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
                        super.act(joueur, positionChoisi, batiment);
                    } else {
                        super.regleArméePort();
                        return;
                    }
                }
            }
        } else if (super.getJeu() instanceof Demeter) {
            Port batiment = new Port(joueur);
            Position positionChoisi = super.getJeu().choisisTuile(joueur);
            if (positionChoisi == null) {
                return;
            }
            while (!(super.getJeu().getPositionsVideVoisinsMer().contains(positionChoisi))) {
                System.out.println(positionChoisi.toString() + "la tuile choisie nest pas voisine de mer");
                positionChoisi = super.getJeu().choisisTuile(joueur);
                if (positionChoisi == null) {
                    return;
                }
                ((JoueurDemeter) joueur).setNbPoints(1);
            }
            super.act(joueur, positionChoisi, batiment);
        }
    }
}
