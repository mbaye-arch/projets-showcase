package demeter.util.action;

import java.util.*;

import util.action.Echanger;
import util.batiment.Batiment;
import util.batiment.Port;
import util.jeu.Jeu;
import util.joueur.Joueur;
import util.plateau.outils.ressource.Ressource;

public class EchangerRessourceViaPort extends Echanger {
    /**
     * constructeur de la classe
     * 
     * @param jeu       le jeu dans lequel l'action est effectuee peut etre Ares ou
     *                  Demeter
     * @param prerequis cette action n'a pas de prerequis
     */
    public EchangerRessourceViaPort(Jeu jeu) {
        super(jeu, new HashMap<>());
    }

    /**
     * cette methode permet d'effectuer l'action
     * 
     * @param joueur     le joueur qui effectue l'action
     * 
     */
    @Override
    public void act(Joueur joueur) {
        System.out.println("Echange de ressources via port");
        // on regarde si le joueur a un port dans sa liste
        List<Batiment> batiments = joueur.getBatiments();
        boolean aPort = false;
        for (Batiment batiment : batiments) {
            if (batiment.equals(new Port(joueur))) {
                aPort = true;
                break;
            }
        }
        if (aPort == true) {
            System.out.println("Vous avez un port");
            System.out.print("Quelle ressource voulez-vous échanger ?");
            Ressource res1 = super.choixRessourceEchange();
            super.getPrerequis().put(res1, 1);
            Ressource res2 = super.choixRessourceAEchanger(res1);
            super.act(joueur, res1, res2, 1, 2);
        } else {
            System.out.println("vous n'avez pas de Port pour effectuer l'echange");
            return;
        }
    }

    /**
     * cette methode permet de retourner le jeu dans lequel l'action est effectuee
     * 
     * @return Jeu le jeu dans lequel l'action est effectuee
     */
    @Override
    public String toString() {
        return "Echange de ressources via un port gratuit 1 Ressource pour 2";
    }
}