package util.ile;

import java.util.*;
import util.plateau.Plateau;
import util.plateau.outils.tuile.Tuile;

/**
 * Cette classe représente une île, un ensemble de 2 ou plusieurs tuiles
 * adjacentes qui forment une île.
 */
public class Ile {
    private int ligne;
    private int colonne;
    private Plateau plateau;
    private Map<Integer, List<Tuile>> iles;

    /**
     * Constructeur de la classe Ile
     * 
     * @param plateau Le plateau qui contient les îles.
     */
    public Ile(Plateau plateau) {
        this.plateau = plateau;
        this.iles = new HashMap<>();
        this.ligne = plateau.getLigne();
        this.colonne = plateau.getColonne();
        List<Tuile> tuilesNonMer = new ArrayList<>(plateau.getTuileNonMer());
        int i = 0;
        while (!tuilesNonMer.isEmpty()) {
            Tuile tuile = tuilesNonMer.get(0);
            List<Tuile> ile = this.donneIle(tuile, tuilesNonMer);
            this.iles.put(i, ile);
            tuilesNonMer.removeAll(ile);
            i++;
        }
    }

    /**
     * Retourne le plateau contenant les îles.
     * 
     * @return Plateau
     */
    public Plateau getPlateau() {
        return this.plateau;
    }

    /**
     * cette methode retourne le nombre de lignes du plateau
     * @return  int le nombre de lignes du plateau
     */
    public int getLigne() {
        return this.ligne;
    }

    /**
     * cette methode retourne le nombre de colonnes du plateau
     * @return  int le nombre de colonnes du plateau
     */
    public int getColonne() {
        return this.colonne;
    }
    /**
     * Retourne la liste des tuiles formant les îles sous forme de dictionnaire
     * où la clé est l'indice de l'île.
     * 
     * @return Map<Integer, List<Tuile>>
     */
    public Map<Integer, List<Tuile>> getTuiles() {
        return this.iles;
    }

    /**
     * Vérifie si une tuile de liste1 a un voisin adjacent dans liste2.
     * 
     * @param liste1 Liste de tuiles à tester.
     * @param liste2 Liste des tuiles voisines potentielles.
     * @return true si au moins une tuile de liste1 a un voisin dans liste2.
     */
    public boolean aUnVoisinProche(List<Tuile> liste1, List<Tuile> liste2) {
        for (Tuile tuile1 : liste1) {
            for (Tuile tuile2 : liste2) {
                if (tuile1.getPosition().sontProches(tuile2.getPosition())) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Trouve toutes les tuiles qui forment une île à partir d'une tuile donnée.
     * 
     * @param tuile       Tuile de départ.
     * @param listeTuiles Liste de toutes les tuiles disponibles.
     * @return Liste des tuiles formant l'île.
     */
    public List<Tuile> donneIle(Tuile tuile, List<Tuile> listeTuiles) {
        List<Tuile> ile = new ArrayList<>();
        Queue<Tuile> queue = new LinkedList<>();
        queue.add(tuile);

        while (!queue.isEmpty()) {
            Tuile current = queue.poll();
            if (!ile.contains(current)) {
                ile.add(current);
            }
            List<Tuile> voisins = new ArrayList<>();
            for (Tuile t : listeTuiles) {
                if (!ile.contains(t) && current.getPosition().sontProches(t.getPosition())) {
                    voisins.add(t);
                }
            }
            queue.addAll(voisins);
            listeTuiles.removeAll(voisins);
        }

        return ile;
    }

    /**
     * cette methode affiche les tuiles de chaque ile
     */
    public void afficherIles() {
        for (int i = 0; i < this.iles.size(); i++) {
            System.out.println("Ile " + i + ":");
            for (Tuile tuile : this.iles.get(i)) {
                System.out.print(tuile.toString() + "__" + tuile.getPosition().toString()+",");
            }
            System.out.println();
        }
    }
}
