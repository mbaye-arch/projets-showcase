package util.action;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import util.jeu.Jeu;
import util.joueur.Joueur;
import util.plateau.outils.ressource.Ressource;

/**
 * cette classe respresente echange dont out les classes vont heriter 
 * ainsi on auras un code plus modulaire 
 */
public class Echanger extends Action {  
    public Echanger(Jeu jeu,HashMap<Ressource,Integer> prerequis){
        super(prerequis,jeu);
    }
    @Override
    public void act(Joueur joueur) throws Exception {
        System.out.println("echange de ressource");
    }
    /**
     * cette permet de faire un echange de ressource 
     * @param joueur le joueur qui fait l'echange 
     * @param res1 la ressource qu'on veut echanger 
     * @param res2 la ressource quon veux avoir 
     * @param nbRes1 le nombre de ressource quon echange pour s1
     * @param nbRes2 le nombre de ressource qu'on aura pour res2
     */
    public void act(Joueur joueur,Ressource res1,Ressource res2,int nbRes1,int nbRes2){
        joueur.addRessource(res1, -nbRes1);
        joueur.addRessource(res2, nbRes2);
    }
    @Override
    public String toString() {
        return "Echange de Ressources";
    }

    /**
     * cette methode serviras sa demande au joueur qulle ressource il vas echanger 
     * et le renvoie 
     * @return Ressource la ressource quon met pour l'echange 
     */
    public Ressource choixRessourceEchange(){
        System.out.println();
        for (int i = 0; i < super.getJeu().getRessource().size(); i++) {
            System.out.println((i)+". "+super.getJeu().getRessource().get(i).toString());
        }
        int choix;
        choix = super.saisisIntIntervalle(1, super.getJeu().getRessource().size());
        Ressource ressource = super.getJeu().getRessource().get(choix -1);
        return ressource;
    }

    public Ressource choixRessourceAEchanger(Ressource res){
        System.out.println("Contre quelle ressources");  
        List<Ressource> ressources = new ArrayList<>(super.getJeu().getRessource());
        ressources.remove(res);
        for (int i = 0; i < ressources.size(); i++) {
            System.out.println((i)+". "+ressources.get(i).toString());
        }
        int choix;
        choix = super.saisisIntIntervalle(1,ressources.size()-1);
        return ressources.get(choix-1);
    }
}
