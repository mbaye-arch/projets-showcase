package util.plateau;

import java.util.ArrayList;
import java.util.List;
import util.plateau.outils.genere.Genere;
import util.plateau.outils.position.Position;
import util.plateau.outils.tuile.Mer;
import util.plateau.outils.tuile.Tuile;

/**
 * Cette classe représente le plateau dans lequel va s'exécuter le jeu.
 */
public class Plateau {
    /**
     * ligne nombre de ligne 
     */
    protected int ligne;
    /**
     * nombre de colonne
     */
    protected int colonne;
    /**
     * table  deux dimension contenat des tuile plateau[][]
     */
    protected Tuile[][] plateau;

    /**
     * Construction de la classe Plateau avec un plateau de taille fixe de 15x15.
     * 
     * @param ligne Nombre de lignes du plateau.
     * @param col Nombre de colonnes du plateau.
     */
    public Plateau(int ligne, int col) {
        Genere gen = new Genere(ligne, col);
        this.ligne = ligne;
        this.colonne = col;
        this.plateau = new Tuile[ligne][col];
        List<Tuile> listeTuile = gen.generateListeTuile();

        // Ajout de la liste des tuiles dans le plateau après la génération
        for (Tuile tuile : listeTuile) {
            this.plateau[tuile.getPosition().getX()][tuile.getPosition().getY()] = tuile;
        }
    }

    /**
     * Retourne le nombre de lignes du plateau.
     *
     * @return Nombre de lignes.
     */
    public int getLigne() {
        return this.ligne;
    }

    /**
     * Retourne le nombre de colonnes du plateau.
     *
     * @return Nombre de colonnes.
     */
    public int getColonne() {
        return this.colonne;
    }

    /**
     * Retourne la grille du plateau contenant les tuiles.
     *
     * @return Une matrice de tuiles représentant le plateau.
     */
    public Tuile[][] getPlateau() {
        return this.plateau;
    }

    /**
     * Retourne la tuile qui se situe à une position donnée.
     *
     * @param pos La position de la tuile recherchée.
     * @return La tuile située à la position donnée.
     */
    public Tuile getTuile(Position pos) {
        return this.plateau[pos.getX()][pos.getY()];
    }

    /**
     * Affiche le tableau du plateau avec les tuiles.
     * 
     */
    public void display() {
        System.out.println();
        System.out.println(this.afficheTete());
        for (int i = 0; i < this.ligne; i++) {
            System.out.print("| ");
            for (int j = 0; j < this.colonne; j++) {
                System.out.print(this.plateau[i][j] + " ");
            }
            System.out.println(" |");
        }
        System.out.println(this.afficheTete());
        System.out.println();
    }

    /**
     * Génère une ligne d'en-tête du plateau pour l'affichage.
     *
     * @param val Le nombre de caractères "_" à afficher.
     * @return Une chaîne représentant l'en-tête du plateau.
     */
    public String afficheTete() {
        String res = "  ";
        for (int i = 0; i < this.colonne; i++) {
            res = res + "____";
        }
        return res;
    }

    /**
     * Retourne la liste des tuiles vides du plateau et qui ne sont pas de types Mer.
     * @return List<Tuile> la liste des tuiles vides du plateau non Mer
     */
    public List<Tuile> getTuileVide(){
        List<Tuile> res = new ArrayList<>();
        for (int i=0;i<this.ligne;i++){
            for(int j= 0;j<this.colonne;j++){
                if ( new Position(i,j).isValide(this.ligne, this.colonne) && (!(this.getTuile(new Position(i, j)) instanceof Mer)) &&this.getTuile(new Position(i, j)).getBatiment()==false){
                    res.add(this.getTuile(new Position(i, j)));
                }
            }
        }
        return res;
    }

    /**
     * cette methode permet de produire des ressources sur les tuiles du plateau
     * avant le recolte 
     */
    public void produceRessource(){
        for (int i = 0; i < this.ligne; i++) {
            for (int j = 0; j < this.colonne; j++) {
                this.getTuile(new Position(i, j)).prodRessource();;
            }
        }
    }

    /**
     * cette methode remet a zero les tuiles dont la ressource a ete recolter du moment quils ont une 
     * batiment 
     */
    public void viderTuile(){
        for (int i = 0; i < this.ligne; i++) {
            for (int j = 0; j < this.colonne; j++) {
                if (this.getTuile(new Position(i, j)).getBatiment()){
                    this.getTuile(new Position(i, j)).setNbRes(0);;
            }
        }
     }
    }

    /**
     * cette methode permet de verifier si une position est valide
     * dans le plateau
     * @param pos la position a verifier
     * @return boolean true si la position est valide, false sinon
     */
    public boolean estValide(Position pos){
        return pos.getX() >= 0 && pos.getX() < this.ligne && pos.getY() >= 0 && pos.getY() < this.colonne;
    }

    /**
     * cette methode permet de retourner la liste des positions vide du plateau
     * @return List<Position> la liste des positions vide du plateau
     */
    public List<Position> getPositionVide(){
        List<Position> res = new ArrayList<>();
        for (int i = 0; i < this.ligne; i++) {
            for (int j = 0; j < this.colonne; j++) {
                if (this.getTuile(new Position(i, j)).getBatiment()==false){
                    res.add(new Position(i, j));
                }
            }
        }
        return res;
    }

    /**
     * cette methode permet de retourner la liste des tuiles non mer du plateau
     * @return List<Tuile> la liste des tuiles non mer du plateau
     */
    public List<Tuile> getTuileNonMer(){
        List<Tuile> res = new ArrayList<>();
        for (int i = 0; i < this.ligne; i++) {
            for (int j = 0; j < this.colonne; j++) {
                if (!(this.getTuile(new Position(i, j)) instanceof Mer)){
                    res.add(this.getTuile(new Position(i, j)));
                }
            }
        }
        return res;
    }

    /**
     * cette renvoie la liste des tuiles voisins dun tuiles donnee qui ne sont pas des mers
     * @param tuile tuile dont on veut connaitre les tuiles voisins
     * @return List<Tuile> tuilesVoisin la liste des tuiles voisins
     */
    public List<Tuile> getTuilesVoisin(Tuile tuile) {
        List<Position> positionVoisin=tuile.getPosition().getPositionVoisin(this.ligne, this.colonne);
        List<Tuile> tuilesVoisin=new ArrayList<>();
        for (Position position : positionVoisin) {
            if (!(this.getTuile(position) instanceof Mer)){
            tuilesVoisin.add(this.getTuile(position));
            }
        }
        return tuilesVoisin;
    }

        /**
     * cette renvoie la liste des tuiles voisins dun tuiles donnee qui ne sont pas des mers
     * @param tuile tuile dont on veut connaitre les tuiles voisins
     * @return List<Tuile> tuilesVoisin la liste des tuiles voisins
     */
    public List<Tuile> getTuilesVoisinMer(Tuile tuile) {
        List<Position> positionVoisin=tuile.getPosition().getPositionVoisins(this.ligne, this.colonne);
        List<Tuile> tuilesVoisin=new ArrayList<>();
        for (Position position : positionVoisin) {
            tuilesVoisin.add(this.getTuile(position));
        }
        return tuilesVoisin;
    }

    /**
     * cette methode permet de retourner la liste des tuiles voisins de la mer
     * @return List<Tuile> la liste des tuiles voisins de la mer
     */
    public List<Tuile> getTuileVideVoisinMer(){
        List<Tuile> res = new ArrayList<>();
        List<Tuile> tuileVide = this.getTuileVide();
        for (Tuile tuile : tuileVide) {
            List<Tuile> tuilesVoisin = this.getTuilesVoisinMer(tuile);
            for (Tuile tuileVoisin : tuilesVoisin) {
                if (tuileVoisin instanceof Mer){
                    if (!res.contains(tuile)){
                        res.add(tuile);
                    }
               }
            }
        }
        return res;
    }

    /**
     * cette methode permet de modifier une tuile du plateau sa me serviras dans les teste 
     * @param newTuile la nouvelle tuile
     */
    public void setTuile(Tuile newTuile){
        this.plateau[newTuile.getPosition().getX()][newTuile.getPosition().getY()]=newTuile;
    }
}
