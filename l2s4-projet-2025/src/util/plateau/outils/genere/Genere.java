package util.plateau.outils.genere;

import java.util.*;
import util.plateau.outils.position.Position;
import util.plateau.outils.tuile.*;

/**
 * cette classe va permettre de gerer la generation aleatoire des tuile qu'on
 * placeras dans le plateau
 */

public class Genere {
    /** la liste permettant le choix aleatoire parmi les tuiles */
    private final String[] tab = { "montagne", "foret", "paturage", "champ", "mer" };
    private int ligne;
    private int col;

    /**
     * Constructeur de la classe Genere
     * 
     * @param ligne nombre de ligne du tableau pour laquelle on genere la liste aleatoire des tuiles
     * @param col nombre de colonne du tableau pour laquelle on genere la liste aleatoire des tuiles
     */
    public Genere(int ligne, int col) {
        this.ligne = ligne;
        this.col = col;
    }

    /**
     * Retourne la liste des position du tableau
     * 
     * @return List(Position) la liste des position du tableau
     */
    public List<Position> donneLIstePosition() {
        List<Position> ListePos = new ArrayList<>();
        for (int i = 0; i < this.ligne; i++) {
            for (int j = 0; j < this.col; j++) {
                ListePos.add(new Position(i, j));
            }
        }
        return ListePos;
    }

    /**
     * Retourn liste de tuile generer aleatoirement avec leur position
     * 
     * @return List(Tuile) liste des tuiles qu'on vas passer au tableau
     */
    public List<Tuile> generateListeTuile() {
        List<Tuile> res = new ArrayList<>();
        List<Position> listePositionTab = this.donneLIstePosition();
        int i = 0;
        Random alea = new Random();
        while (i < (this.ligne * this.col) / 6) {
            int val = alea.nextInt(listePositionTab.size());
            Position posChoisie = listePositionTab.get(val);
            Position posVoisin = posChoisie.getCoteAlea(this.ligne, this.col);
            res.add(this.genereTuile(posChoisie));
            res.add(this.genereTuile(posVoisin));
            listePositionTab.remove(posChoisie);
            listePositionTab.remove(posVoisin);
            i++;
        }
        for (Position position : listePositionTab) {
            res.add(new Mer(position));
        }
        return res;
    }

    /**
     * Retourne une tuile generer aleatoirement
     * 
     * @param pos la positon a mettre sur la tuile generer
     * @return Tuile un nouveau tuile avec le position comme sa parametre
     */
    public Tuile genereTuile(Position pos) {
        Random alea = new Random();
        int val = alea.nextInt(tab.length);
        Tuile res;
        if (val == 0) {
            res = new Montagne(pos);
        } else if (val == 1) {
            res = new Foret(pos);
        } else if (val == 2) {
            res = new Paturage(pos);
        } else {
            res = new Champs(pos);
        }
        return res;
    }
}
