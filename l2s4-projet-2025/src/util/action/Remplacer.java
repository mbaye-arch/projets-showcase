package util.action;

import java.util.HashMap;
import java.util.List;

import util.batiment.Batiment;
import util.jeu.Jeu;
import util.joueur.Joueur;
import util.plateau.outils.ressource.Ressource;
import util.plateau.outils.tuile.Tuile;

public class Remplacer extends Action {
    /**
     * constructeur
     * @param prerequis
     * @param jeu
     */
    public Remplacer(HashMap <Ressource,Integer> prerequis,Jeu jeu){
        super(prerequis,jeu);
    }

    /**
     * @param joueur
     * @param tuile
     * @param bat
     * @return
     * @throws Exception
     */
    public boolean act(Joueur joueur,Tuile tuile,Batiment bat) throws Exception {
        return super.getJeu().replaceBatiment(tuile, bat, joueur);
    }

    @Override
    public String toString() {
        return "Remplacer";
    }
    @Override
    public void act(Joueur joueur) throws Exception {
        System.err.println("actions sans attributs");
    }

    public Tuile chosisTuileReplace(Joueur joueur,List<Tuile> tuiles){
        System.out.println("Choisissez la tuile à remplacer");
            for (int i = 0; i < tuiles.size(); i++) {
                System.out.println((i + 1) + ". " + tuiles.get(i).getPosition().toString());
            }
            int tuile=super.saisisIntIntervalle(1, tuiles.size());
            Tuile tuil = tuiles.get(tuile-1);
            return tuil;
    }
    
}
