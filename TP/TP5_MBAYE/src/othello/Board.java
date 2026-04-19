package othello;

import othello.util.*;

/**
 * class Board representant le table de jeux
 */
public class Board {
    private Pawn[][] table;
    private final int taille = 8;

    /**
     * a la creation la table contient 4 pîons deja pose a des positions bien
     * definis
     * comme dans les regles du jeu
     */
    public Board() {
        this.table = new Pawn[this.taille][this.taille];
        this.table[3][3] = new Pawn(Couleur.WHITE);
        this.table[3][4] = new Pawn(Couleur.BLACK);
        this.table[4][3] = new Pawn(Couleur.BLACK);
        this.table[4][4] = new Pawn(Couleur.WHITE);
    }

    /**
     * cette methode retourne le pions dans la case du position donne
     * 
     * @param position la position du case
     * @return a pion ou null
     * @throws InvalidPositionException si la position nest pas valide
     */
    public Pawn getPawnAt(Position position) throws InvalidPositionException {
        if (!position.estPositionValide()) {
            throw new InvalidPositionException("position non valide dans le tableau ou null");
        } else {
            return this.table[position.getX()][position.getY()];
        }
    }

    /**
     * cette methode permet de prendre une position et une pion et d'y placer le
     * pion
     * on aura des erreurs si la position est invalide
     * ou contient deja un pion ou nest pas dans le tableau valide du pion s a jouer
     * 
     * @param position position a prendre
     * @param pion     pion a prendre
     * @throws InvalidPositionException erreur a renvoyer au cas ou
     */
    public void putPawnAt(Position position, Pawn pion) throws InvalidPositionException {
        if (!position.estPositionValide()) {
            throw new InvalidPositionException("Position invalide dans le tableau");
        } else if (this.getPawnAt(position) != null) {
            throw new InvalidPositionException("Cette position contient deja un pion");
        } else {
            this.table[position.getX()][position.getY()] = pion;
        }
    }

    /**
     * cette methode retourne toutes les position des cases null dans le tableau
     * 
     * @return liste de position null dans le tableau
     */
    public Position[] getPositionNull() {
        Position[] liste = new Position[60];
        int k = 0;
        for (int i = 0; i < taille; i++) {
            for (int j = 0; j < taille; j++) {
                if (this.table[i][j] == null) {
                    liste[k] = new Position(i, j);
                    k++;
                }
            }
        }
        Position[] res = this.filtrePositionListe(liste, k);
        return res;
    }

    /**
     * cette methode renvoie true si le tableau est complet
     * 
     * @return True or false si le tableau est complet
     */
    public boolean estComplet() {
        return this.getPositionNull().length == 0;
    }

    /**
     * cette methode prend une position donne et renvoie ces coordonnes de proximite
     * 
     * @param position position a prendre
     * @return liste de position qui sont les proximites
     */
    public Position[] getPositionProxi(Position position) {
        Position[] listeProxi = new Position[8];
        int k = 0;
        for (Direction direction : Direction.values()) {
            Position newPosition = direction.PositionSuivantDirection(position);
            if (newPosition.estPositionValide()) {
                listeProxi[k] = newPosition;
                k++;
            }
        }
        Position[] res = this.filtrePositionListe(listeProxi, k);
        return res;
    }

    /**
     * cette methode vas me retourner une liste contenant les coordonnes du pion
     * prend en parametre le pion
     * 
     * @param pion pion a voir toutes les positions
     * @return liste contenant toutes les positions de pions
     * @throws InvalidPositionException erreur a renvoyer
     */
    public Position[] getAllPositionPion(Pawn pion) throws InvalidPositionException {
        Position[] listePion = new Position[64];
        int k = 0;
        for (int i = 0; i < this.taille; i++) {
            for (int j = 0; j < this.taille; j++) {
                if (this.table[i][j] != null && this.table[i][j].equals(pion)) {
                    listePion[k] = new Position(i, j);
                    k++;
                }
            }
        }
        Position[] res = this.filtrePositionListe(listePion, k);
        return res;
    }

    /**
     * cette methode me renvoie un liste de tuple positions
     * qui sont a cote des nulls a fonction du pion
     * 
     * @param pions le parametre pion
     * @return TuplePosition[] tuple a renvoer
     * @throws InvalidPositionException erreur renvoyer
     */
    public TuplePosition[] getPositionCoteVide(Pawn pions) throws InvalidPositionException {
        Position[] listeNull = this.getPositionNull();
        Position[] listePions = this.getAllPositionPion(pions);
        TuplePosition[] listeTuplePositions = new TuplePosition[64];
        int k = 0;
        for (Position position1 : listePions) {
            for (Position position2 : listeNull) {
                if (position1.SontCoteACot(position2)) {
                    listeTuplePositions[k] = new TuplePosition(position1, position2);
                    k++;
                }
            }
        }
        TuplePosition[] res = this.filtreTupleListe(listeTuplePositions, k);
        return res;
    }

    /**
     * cette methode retourne la liste des tuples positions valides dun pion
     * 
     * @param pion pion a prendre
     * @return liste contenant tupleposition valide
     * @throws InvalidPositionException erreur renvoyer
     */
    public TuplePosition[] getPositionValide(Pawn pion) throws InvalidPositionException {
        TuplePosition[] listeValide = new TuplePosition[64];
        int k = 0;
        Pawn pionInverse = pion.getPionInverse();
        TuplePosition[] picv = this.getPositionCoteVide(pionInverse);
        for (TuplePosition tuplePosition : picv) {
            Position position1 = tuplePosition.getPosition1();
            Position positionNull = tuplePosition.getPosition2();
            Position direction = position1.getDirection(positionNull);
            Position position2 = position1;
            while (position2.estPositionValide() &&
                    this.getPawnAt(position2) != null &&
                    this.getPawnAt(position2).equals(pionInverse)) {
                position2 = position2.getPositionDirection(direction);
            }
            if (position2.estPositionValide() &&
                    this.getPawnAt(position2) != null &&
                    this.getPawnAt(position2).equals(pion)) {
                listeValide[k] = tuplePosition;
                k++;
            }
        }

        TuplePosition[] res = this.filtreTupleListe(listeValide, k);

        return res;
    }

    /**
     * cette methode prend une tuple position et donne la liste des position a
     * reverse
     * 
     * @param pionInverse   pion inverse a prendre
     * @param tupleposition tuple a prendre
     * @throws InvalidPositionException erreur a renvoyer
     * @return liste tuples
     */
    public Position[] getListeAreverse(TuplePosition tupleposition, Pawn pionInverse) throws InvalidPositionException {
        Position[] listeposition = new Position[64];
        int k = 1;
        Position position1 = tupleposition.getPosition1();
        Position position2 = tupleposition.getPosition2();
        Position direction = position1.getDirection(position2);
        listeposition[0] = position1;
        Position suivant = position1.getPositionDirection(direction);
        while (suivant.estPositionValide() &&
                this.getPawnAt(suivant).equals(pionInverse)) {
            listeposition[k] = suivant;
            suivant = suivant.getPositionDirection(direction);
            k++;
        }
        Position[] res = this.filtrePositionListe(listeposition, k);
        return res;
    }

    /**
     * methode toString qui fait une affichage du tableau
     * 
     * @return String
     */
    public String toString() {
        String chaine = "   \n\t  0   1   2   3   4   5   6   7\n\t_________________________________\n";
        for (int i = 0; i < this.taille; i++) {
            int n = i;
            chaine += "    " + n + "\t| ";
            for (int j = 0; j < this.table[i].length; j++) {
                String value = (this.table[i][j] == null) ? " " : this.table[i][j].toString();
                chaine += value + " | ";
            }

            chaine += "\n\t_________________________________\n";
        }
        return chaine;
    }

    /*
     * ces methodes prend en parametre une liste et le filtre selon ksa enleve les
     * null
     * 
     * @param liste tuplePosition a filtre
     * 
     * @param k le for du filtre
     * 
     * @return res une nouvelle liste sans null
     */
    public TuplePosition[] filtreTupleListe(TuplePosition[] liste, int k) {
        TuplePosition[] res = new TuplePosition[k];
        for (int i = 0; i < k; i++) {
            res[i] = liste[i];
        }
        return res;
    }

    /*
     * ces methodes prend en parametre une liste et le filtre selon ksa enleve les
     * null
     * 
     * @param liste tuplePosition a filtre
     * 
     * @param k le for du filtre
     * 
     * @return res une nouvelle liste sans null
     */
    public Position[] filtrePositionListe(Position[] liste, int k) {
        Position[] res = new Position[k];
        for (int i = 0; i < k; i++) {
            res[i] = liste[i];
        }
        return res;
    }

}