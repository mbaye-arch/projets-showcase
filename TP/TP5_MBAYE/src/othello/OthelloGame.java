package othello;

import othello.util.*;
import io.Input;

/**
 * la classe othelloGame combinant joueur pion et tableau
 */
public class OthelloGame {
    private Joueur joueur1;
    private Joueur joueur2;
    private final Board board = new Board();

    /**
     * constructeur de la classe othelloGame
     * 
     * @param joueur1 le premiere joueur du table
     * @param joueur2 la deuxieme joueur du table
     */
    public OthelloGame(Joueur joueur1, Joueur joueur2) {
        this.joueur1 = joueur1;
        this.joueur2 = joueur2;

    }
    /**
     * cette methode retourne le joueur 1
     * @return joueur le joueur 
     */
    public Joueur getJoueur1(){
        return this.joueur1;
    }
    /**
     * cette methode retourne le joueur 2
     * @return joueur le joueur 
     */
    public Joueur getJoueur2(){
        return this.joueur2;
    }
    /**
     * return le tableau de jeu
     * 
     * @return board
     */
    public Board getBoard() {
        return this.board;
    }

    /**
     * cette methode prend en parametre une position et un pion et recupere a liste
     * des
     * pions a reverse et les reverse
     * 
     * @param pos  position a put
     * @param pion pion pour le reverse et regarder les autres
     * @throws InvalidPositionException erreur renvoyer
     */
    public void applyConsequence(Position pos, Pawn pion) throws InvalidPositionException {
        Pawn pionInverse = pion.getPionInverse();
        TuplePosition[] positionValide = this.board.getPositionValide(pion);
        for (TuplePosition tuplePosition : positionValide) {
            if (tuplePosition.getPosition2().equals(pos)) {
                Position[] listeAReverse = this.board.getListeAreverse(tuplePosition, pionInverse);
                for (Position position : listeAReverse) {
                    this.board.getPawnAt(position).reverse();
                }
            }
        }
    }

    /**
     * cette methode fait jouer au joueur a une position
     * et apllique les consequences
     * 
     * @param pos  posiktion ou on joue
     * @param pion pion qui joue
     * @throws InvalidPositionException erreur renvoyer
     */
    public void playAtPosition(Position pos, Pawn pion) throws InvalidPositionException {
        this.applyConsequence(pos, pion);
        this.board.putPawnAt(pos, pion);

    }

    /**
     * cette methode affiche les positions valides ou il peut joueur et
     * lui demande den choisir une sa retourne un nombre
     * 
     * @param liste  liste a regarder
     * @param joueur joeur qui joue
     * @return nombre joueur
     */
    public int afficheSeqListeDemandeSaisis(TuplePosition[] liste, Joueur joueur) {
        int i = 1;
        for (TuplePosition tp : liste) {
            System.out.println(i + " : " + tp.getPosition2().toString());
            i++;
        }

        System.out.println(joueur.toString() + "\nChoisissez une position dans laquelle vous voulez jouer");
        int n = -1;

        while (true) {
            String choix = Input.readString();

            try {
                n = Integer.parseInt(choix);

                if (n > 0 && n <= liste.length) {
                    break;
                } else {
                    System.out.println(
                            "Valeur Invalide dans la liste des positions valides.\nChoisissez une nouvelle : ");
                }
            } catch (NumberFormatException e) {
                System.out.println("La valeur saisie ne correspond pas à un nombre !\nChoisissez une nouvelle : ");
            }
        }

        return n;
    }

    /**
     * cette methode permet de jouer aune round
     * 
     * @throws InvalidPositionException erreur renvoyer
     */
    public void playOneRound() throws InvalidPositionException {
        TuplePosition[] listeJoueur1 = this.board.getPositionValide(new Pawn(joueur1.getCouleur()));
        TuplePosition[] listeJoueur2 = this.board.getPositionValide(new Pawn(joueur2.getCouleur()));
        if (listeJoueur1.length >= 1) {
            int choix = this.afficheSeqListeDemandeSaisis(listeJoueur1, joueur1);
            playAtPosition(listeJoueur1[choix - 1].getPosition2(), new Pawn(joueur1.getCouleur()));
            System.out.println(this.board.toString());
            listeJoueur2 = this.board.getPositionValide(new Pawn(joueur2.getCouleur()));
        } else {
            System.out.println("Joueur 1 passe son tour, aucun coup valide.");
            listeJoueur2 = this.board.getPositionValide(new Pawn(joueur2.getCouleur()));
        }

        if (listeJoueur2.length >= 1) {
            int choix = this.afficheSeqListeDemandeSaisis(listeJoueur2, joueur2);
            playAtPosition(listeJoueur2[choix - 1].getPosition2(), new Pawn(joueur2.getCouleur()));
            System.out.println(this.board.toString());
        } else {
            System.out.println("Joueur 2 passe son tour, aucun coup valide.");
        }

    }
    /**
     * cette methode donne le gagnant dans le jeu 
     * @throws InvalidPositionException erreur a retourner 
     * @return Joueur etourne le joueur gagnant ou null
     */
    public Joueur donneGagnant() throws InvalidPositionException {
        Position[] liste1 = this.board.getAllPositionPion(new Pawn(joueur1.getCouleur()));
        Position[] liste2 = this.board.getAllPositionPion(new Pawn(joueur2.getCouleur()));
        if (liste1.length > liste2.length) {
            return joueur1;
        } else if (liste1.length < liste2.length) {
            return joueur2;
        } else {
            return null;
        }
    }

    /**
     * cette methode permet de jouer au jeu complet
     * 
     * @throws InvalidPositionException erreurs renvoyer
     */
    public void play() throws InvalidPositionException {
        System.out.println("\nBienvenue sur le jeu Othello vos positions vous serons propose et vous ferez vos choix de position");
        TuplePosition[] listeJoueur1 = this.board.getPositionValide(new Pawn(joueur1.getCouleur()));
        TuplePosition[] listeJoueur2 = this.board.getPositionValide(new Pawn(joueur2.getCouleur()));
        int i=0;
        System.out.println(this.board.toString());
        while (i==0&&!this.board.estComplet() && (listeJoueur1.length >= 1 || listeJoueur2.length >= 1)) {
            this.playOneRound();
            if (listeJoueur1.length < 1 && listeJoueur2.length < 1) {
                break;
            }
        }

        System.out.println("La partie est terminée.");
        i++;
        if(this.donneGagnant()!=null){
        System.out.println(this.donneGagnant().toString()+ " A GAGNE");
        }
        else{
            System.out.println("Match Null");
        }
    }

}