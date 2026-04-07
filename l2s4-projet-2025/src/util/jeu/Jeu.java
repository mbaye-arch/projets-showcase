package util.jeu;

import ares.Ares;
import ares.util.batiment.Armée;
import ares.util.joueur.JoueurAres;
import demeter.util.batiment.Ferme;
import demeter.util.joueur.JoueurDemeter;

import java.util.*;
import util.action.*;
import util.batiment.*;
import util.ile.Ile;
import util.joueur.Joueur;
import util.plateau.Plateau;
import util.plateau.outils.position.Position;
import util.plateau.outils.ressource.Ressource;
import util.plateau.outils.tuile.Mer;
import util.plateau.outils.tuile.Tuile;

/**
 * cette classe represente un jeu abstrait etant un le noyau des deux jeux
 */
public abstract class Jeu {
    // le scanner de la classes
    public Scanner sc;
    // la liste des ressources
    public ArrayList<Ressource> ressources = new ArrayList<>();
    // le plateau du jeu
    protected Plateau plateau;
    // la liste des joueurs
    protected List<Joueur> joueurs;
    // le nombre de tours jouer
    protected int nbTours;
    // l'elements constituants les iles
    protected Ile iles;
    // la liste des actions
    protected List<Action> actions;
    // un variable qui vas nous permettre de gerer notre jeu en mode simulation
    protected boolean estEnSimulation = false;
    // un valeur random en charge de l'alea
    protected Random random = new Random();

    /*
     * cette attribut represente la relation entre les tuiles et les batiments
     * avec comme cle la tuile vue qu'il est unique sur le plateau
     */
    protected Map<Tuile, Batiment> relationTuileBatiment;

    /**
     * constructeur de la classe
     *
     * @param joueurs               les joueurs du jeu
     * @param relationTuileBatiment la relation entre les tuiles et les
     *                              batiments
     * @param plateau               le plateau du jeu
     * @param nbTours               le nombre de tours du jeu
     */
    public Jeu(int ligne, int colonne) {
        if (ligne < 10 || colonne < 10) {
            throw new IllegalArgumentException("La taille du plateau doit etre superieur a 10");
        }
        this.plateau = new Plateau(ligne, colonne);
        this.joueurs = new ArrayList<>();
        this.relationTuileBatiment = new HashMap<>();
        this.nbTours = 1;
        this.iles = new Ile(this.plateau);
        this.actions = new ArrayList<>();
        this.sc = new Scanner(System.in);
        this.ressources = new ArrayList<>();
        // Initialisation des ressources
        this.ressources.add(Joueur.BOIS);
        this.ressources.add(Joueur.BLE);
        this.ressources.add(Joueur.MINERAIS);
        this.ressources.add(Joueur.MOUTON);
        this.addActions((Action) new NeRienFaire());
        this.actions.add(new ConstruirePort(this));
    }

    public void setEstEnSimulation(boolean valeur) {
        this.estEnSimulation = valeur;
    }

    public boolean getEstEnSimulation() {
        return this.estEnSimulation;
    }

    /**
     * permet l'ajout des actions dans le jeu
     *
     * @param action
     */
    public void addActions(Action action) {
        if (!(this.actions.contains(action))) {
            this.actions.add(action);
        }
    }

    /**
     * ajout des ressources dan le jeu
     */
    public static void initialiserRessources() {

    }

    /**
     * cette methode retourne la liste des ressources
     * 
     * @return List<Ressources RESSOURCES
     */
    public List<Ressource> getRessource() {
        return this.ressources;
    }

    /**
     * cette methode retourne le plateau du jeu
     *
     * @return Plateau le plateau du jeu
     */
    public Plateau getPlateau() {
        return this.plateau;
    }

    /**
     * cette methode retourne les joueurs du jeu
     *
     * @return List<Joueur> les joueurs du jeu
     */
    public List<Joueur> getJoueurs() {
        return this.joueurs;
    }

    /**
     * cette methode retourne la relation entre les tuiles et les batiments
     *
     * @return Map<Tuile, Batiment> la relation entre les tuiles et les
     *         batiments
     */
    public Map<Tuile, Batiment> getRelationTuileBatiment() {
        return this.relationTuileBatiment;
    }

    /**
     * cette methode retourne le nombre de ligne du plateau
     *
     * @return int le nombre de ligne du plateau
     */
    public int getLIgne() {
        return this.plateau.getLigne();
    }

    /**
     * cette methode retourne le nombre de colonne du plateau
     *
     * @return int le nombre de colonne du plateau
     */
    public int getColonne() {
        return this.plateau.getColonne();
    }

    /**
     * cette methode permet d'ajouter un joueur au jeu
     *
     * @param joueur le joueur a ajouter
     * @return boolean true si le joueur a ete ajoute et false sinon
     */
    public boolean ajouterJoueur(Joueur joueur) {
        if (!(this.joueurs.contains(joueur))) {
            this.joueurs.add(joueur);
            return true;
        }
        return false;
    }

    /**
     * cette methode permet de supprimer un joueur du jeu
     *
     * @param joueur le joueur a supprimer
     * @return boolean true si le joueur a ete supprime et false sinon
     */
    public boolean supprimerJoueur(Joueur joueur) {
        if (this.joueurs.contains(joueur)) {
            this.joueurs.remove(joueur);
            return true;
        }
        return false;
    }

    /**
     * cete methode permet de faire passer le jeu à une nouvelle phase en
     * faisant la recolte des batiments des joueurs
     *
     * @return boolean true si le jeu est passe a une nouvelle phase et false
     *         sinon
     */
    public void passerPhase() {
        this.recolte();
        this.nbTours++;
    }

    /**
     * cette methode affiche les tuiles vide avec leur position pour permettre
     * au joueur de choisir
     */
    public List<Tuile> afficheTuileVide() {
        List<Tuile> res = this.plateau.getTuileVide();
        for (Tuile tuile : res) {
            System.out.println(tuile.toString() + " a la position " + tuile.getPosition());
        }
        return res;
    }

    /**
     * cette methode permet d'ajouter un batiment à une tuile
     *
     * @param tuile    la tuile ou ajouter le batiment
     * @param batiment le batiment a ajouter
     * @throws NoValidTuilePlacementException
     */
    public void addBatiment(Tuile tuile, Batiment batiment) throws NoValidTuilePlacementException {
        if (tuile.getBatiment()) {
            throw new NoValidTuilePlacementException("Tuile deja occupee");
        }
        if (this.plateau.getTuile(tuile.getPosition()) instanceof Mer) {
            throw new NoValidTuilePlacementException("Tuile de type Mer");
        }
        this.relationTuileBatiment.put(tuile, batiment);
        tuile.setBatiment(true);
        batiment.setTuile(tuile);
        batiment.getProprietaire().getBatiments().add(batiment);
    }

    /**
     * cette methode permet de faire la recolte dans le jeu en fonction des
     * tuiles et des batiments chaque joueur recolte les ressources des tuiles
     * ou il a un batiment en fonction de la dimension du batiment
     */
    public void recolte() {
        this.plateau.produceRessource();
        for (Tuile tuile : this.relationTuileBatiment.keySet()) {
            Batiment batiment = this.relationTuileBatiment.get(tuile);
            int nbRes = tuile.getNbRes() * batiment.getDimension();
            Joueur joueur = batiment.getProprietaire();
            joueur.addRessource(tuile.getRessource(), nbRes);
        }
        this.plateau.viderTuile();
    }

    /**
     * cette methode permet au joueur de choisir une tuile vide par sa
     * position pour y placer un batiment
     *
     * @param joueur le joueur qui doit choisir la tuile
     * @return Position la position de la tuile choisie
     */
    public Position choisisTuile(Joueur joueur) {
        List<Tuile> tuilesVides = this.plateau.getTuileVide();
        if (tuilesVides.isEmpty()) {
            System.out.println("Il n'y a plus de tuiles vides pour construction.");
            return null;
        }
        // Affichage du plateau
        this.display();
        System.out
                .println("Joueur " + joueur.toString() + ", choisissez la tuile où vous voulez placer votre bâtiment.");
        int x, y;
        // gestion en mode simu
        if (this.estEnSimulation) {
            Tuile tuile = tuilesVides.get(this.random.nextInt(tuilesVides.size()));
            x = tuile.getPosition().getX();
            y = tuile.getPosition().getY();
            System.out.println("choix x : " + x);
            System.out.println("choix y : " + y);
        } else {
            while (true) {
                System.out.print("Coordonnée X (0-" + (this.plateau.getLigne() - 1) + ") : ");
                if (sc.hasNextInt()) {
                    x = sc.nextInt();
                    if (x >= 0 && x < this.plateau.getLigne()) {
                        break;
                    }
                }
                System.out
                        .println("Erreur : Entrez un entier valide entre 0 et " + (this.plateau.getLigne() - 1) + ".");
                sc.nextLine(); // Vider le buffer
            }
            // Saisie de la coordonnée Y
            while (true) {
                System.out.print("Coordonnée Y (0-" + (this.plateau.getColonne() - 1) + ") : ");
                if (sc.hasNextInt()) {
                    y = sc.nextInt();
                    if (y >= 0 && y < this.plateau.getColonne()) {
                        break;
                    }
                }
                System.out.println(
                        "Erreur : Entrez un entier valide entre 0 et " + (this.plateau.getColonne() - 1) + ".");
                sc.nextLine(); // Vider le buffer
            }
        }
        // Vérification si la tuile est vide
        Position position = new Position(x, y);
        Tuile tuileChoisie = this.plateau.getTuile(position);
        if (!tuilesVides.contains(tuileChoisie)) {
            System.out
                    .println("Erreur : La tuile sélectionnée n'est pas vide ou est de Type Mer. Veuillez recommencer.");
            return choisisTuile(joueur); // Relance la fonction si la tuile est occupée
        }
        return position;
    }

    /**
     * cette methode permet de retourner le joueur gagnant
     *
     * @return Joueur le joueur gagnant
     */
    public abstract Joueur getGagnant();

    /**
     * cette methode permet de retourner les tuiles d'un type donnée avec son
     * joueur proprietaire
     *
     * @param batiment
     * @return List<Tuile> la liste des tuiles contenant le type donnee avec son
     *         joueur proprietaire
     */
    public List<Tuile> getTuileType(Batiment batiment, Joueur joueur) {
        List<Tuile> res = new ArrayList<>();
        for (Tuile tuile : this.relationTuileBatiment.keySet()) {
            if (this.relationTuileBatiment.get(tuile).getClass() == batiment.getClass()
                    && this.relationTuileBatiment.get(tuile).getProprietaire().equals(joueur)) {
                res.add(tuile);
            }
        }
        return res;
    }

    /**
     * cette methode permet de supprimer un batiment d'une tuile
     *
     * @param tuile la tuile ou supprimer le batiment
     */
    public void removeBatiment(Tuile tuile) {
        this.relationTuileBatiment.get(tuile).setTuile(null);
        this.relationTuileBatiment.remove(tuile);
        tuile.setBatiment(false);
    }

    /**
     * cette methode permet d'afficher les batiments d'un joueur
     *
     * @param joueur
     */
    public void displayBatimentJoueur(Joueur joueur) {
        for (Tuile tuile : this.relationTuileBatiment.keySet()) {
            if (this.relationTuileBatiment.get(tuile).getProprietaire().equals(joueur)) {
                System.out.println(
                        this.relationTuileBatiment.get(tuile).toString() + " a la position " + tuile.getPosition());
            }
        }
    }

    /**
     * cette methode permet de retourner les joueurs sans le joueur donné en
     * parametre
     *
     * @param joueur
     * @return res
     */
    public List<Joueur> getJoueursSansJ(Joueur joueur) {
        List<Joueur> res = new ArrayList<>();
        for (Joueur j : this.joueurs) {
            if (!j.equals(joueur)) {
                res.add(j);
            }
        }
        return res;
    }

    /**
     * cette methode renvoie une texte si le choix est invalide
     *
     * @param choix le choix de l'utilisateur
     * @param min   le minimum du choix
     * @param max   le maximum du choix
     * @return int le choix de l'utilisateur
     */
    public int choixInvalide(int choix, int min, int max) {
        while (choix < min || choix > max) {
            System.out.println("Choix invalide Reessayez valeur entre " + min + " et " + max);
            System.out.print("Choix :");
            choix = sc.nextInt();
        }
        return choix;
    }

    /**
     * cette methode affiche tuile et batiment avec leur proprietaire
     * 
     * @param tuile la tuiles
     * @param bat   le batiment
     * @return String chaine de caractere
     */
    public String displayTuileBatiment(Tuile tuile, Batiment bat) {
        return tuile.toString() + bat.toStringB() + bat.getProprietaire().toString().charAt(0);
    }

    /**
     * Cette méthode affiche le plateau de jeu avec les indices des lignes et
     * colonnes.
     */
    public void display() {
        System.out.println();
        // Déterminer la largeur fixe pour chaque case
        final int CELL_WIDTH = 7; // Ajustable selon les besoins
        // Affichage des indices des colonnes
        System.out.print("    "); // Espacement pour aligner avec l'indice des lignes
        for (int j = 0; j < this.plateau.getColonne(); j++) {
            System.out.print(String.format("%-" + CELL_WIDTH + "d", j));
        }
        System.out.println();
        System.out.println();

        for (int i = 0; i < this.plateau.getLigne(); i++) {
            // Affichage des indices des lignes
            System.out.print(String.format("%-3d", i)); // Indice + séparation
            for (int j = 0; j < this.plateau.getColonne(); j++) {
                Tuile tuile = this.plateau.getTuile(new Position(i, j));
                String content;
                if (this.relationTuileBatiment.containsKey(tuile)) {
                    content = this.displayTuileBatiment(tuile, this.relationTuileBatiment.get(tuile));
                } else {
                    content = tuile.toString();
                }
                // Ajustement pour aligner l'affichage
                System.out.print(String.format("%-" + CELL_WIDTH + "s", content));
            }
            System.out.println();
        }
        System.out.println();
    }

    /**
     * cette methode donne le nombre de guerrier d'un joueur dans une ile
     *
     * @param joueur le joueur
     * @param ile    liste de tuile representant l'iles
     * @return int le nombre de guerrier
     */
    public int getNbGuerrierIleJoueur(Joueur joueur, List<Tuile> ile) {
        int nbGuerrier = 0;
        for (Tuile tuile : ile) {
            Batiment bat = this.relationTuileBatiment.get(tuile);
            if (bat != null && bat.getProprietaire().equals(joueur) && bat instanceof Armée) {
                nbGuerrier = nbGuerrier + ((Armée) bat).getNbGuerrier();
            }
        }
        return nbGuerrier;
    }

    /**
     * cette methode permet de recuperer le numero d'une ile a parrtir de la
     * position données
     *
     * @param position
     * @return int le numero de l'ille
     */
    public int getIlePosition(Position position) {
        int numeroIle = 0;
        for (int numIle : this.iles.getTuiles().keySet()) {
            for (Tuile tuile : this.iles.getTuiles().get(numIle)) {
                if (tuile.getPosition().equals(position)) {
                    numeroIle = numIle;
                    break;
                }
            }
        }
        return numeroIle;
    }

    /**
     * cette methode retourne celui qui a conquis lile en quelque celui qui as
     * le plus de guerrie dans l'ile
     * 
     * @param int le numero de lile
     * @return Joueur le joueur qui as conquis l'ile
     */
    public Joueur occupeIle(Position position) {
        int numeroIle = this.getIlePosition(position);
        List<Tuile> ile = this.iles.getTuiles().get(numeroIle);
        Map<Joueur, Integer> joueurNbGuerrierIle = new HashMap<>();
        for (Joueur joueur : this.joueurs) {
            joueurNbGuerrierIle.put(joueur, this.getNbGuerrierIleJoueur(joueur, ile));
        }
        // trouver le joueur avec le maximum de guerrier dans a liste
        Joueur joueurConquerant = null;
        int maxGuerriers = 0;
        for (Map.Entry<Joueur, Integer> entry : joueurNbGuerrierIle.entrySet()) {
            if (entry.getValue() > maxGuerriers) {
                maxGuerriers = entry.getValue();
                joueurConquerant = entry.getKey();
            } else if (entry.getValue() == maxGuerriers) {
                joueurConquerant = null;
            }
        }
        return joueurConquerant;
    }

    /**
     * cette methode retourne les positions vide voisins de Mer necessaire pour la
     * construction de port
     * 
     * @return List<position> les positions vides voisins de Mer
     */
    public List<Position> getPositionsVideVoisinsMer() {
        List<Position> res = new ArrayList<>();
        for (Tuile tuile : this.plateau.getTuileVideVoisinMer()) {
            res.add(tuile.getPosition());
        }
        return res;
    }

    /**
     * cettte methode renvoie vrai si un joueur occuper une ile
     * 
     * @param joueur    le joueur
     * @param numeroIle le numero de l'ile
     * @return boolean vari sil occupe lile false sinon
     */
    public boolean occupeIle(Joueur joueur, int numeroIle) {
        int maxGuerriers = 0;
        Map<Joueur, Integer> joueurNbGuerrierIle = new HashMap<>();
        if (!(this.iles.getTuiles().containsKey(numeroIle))) {
            return false;
        } else {
            List<Tuile> ile = this.iles.getTuiles().get(numeroIle);
            for (Joueur j : this.joueurs) {
                joueurNbGuerrierIle.put(j, this.getNbGuerrierIleJoueur(joueur, ile));
            }
            maxGuerriers = Collections.max(joueurNbGuerrierIle.values());
        }
        return joueurNbGuerrierIle.get(joueur) == maxGuerriers;
    }

    /**
     * cette methode retourne une liste des iles que occupe le joueur utile pour la
     * construction de port
     * 
     * @param joueur
     * @return List<int> liste numero des iles
     */
    public List<Integer> getIlesOccupeJoueur(Joueur joueur) {
        List<Integer> res = new ArrayList<>();
        for (int ile : this.iles.getTuiles().keySet()) {
            if (this.occupeIle(joueur, ile)) {
                res.add(ile);
            }
        }
        return res;
    }

    /**
     * cette methode permet de savoir si un joueur a une port sur une ile donné
     * 
     * @param joueur le joueur
     * @param ile    ou numiles
     * @return vari ou faux sil a un port sur cette ile
     */
    public boolean hasPort(Joueur joueur, int numIle) {
        boolean res = false;
        List<Tuile> iles = this.iles.getTuiles().get(numIle);
        for (Tuile tuile : iles) {
            Batiment bat = this.relationTuileBatiment.get(tuile);
            if (bat != null && bat instanceof Port && bat.getProprietaire().equals(joueur)) {
                return true;
            }
        }
        return res;
    }

    /**
     * cette methode verifie que le joueur a deux batiment dans une iles qu'il
     * occupe
     * 
     * @param joueur le joueur pour lequelle on cherche
     * @param intege numile
     * @return boolean vrai ou faux
     */
    public boolean hasDeuxBatiment(Joueur joueur, int numIle) {
        List<Tuile> iles = this.iles.getTuiles().get(numIle);
        int decompte = 0;
        for (Tuile tuile : iles) {
            Batiment bat = this.relationTuileBatiment.get(tuile);
            if (bat != null && bat.getProprietaire() == joueur) {
                decompte = decompte + 1;
            }
            if (decompte == 2) {
                return true;
            }
        }
        return false;
    }

    /**
     * cette methode retourne la liste des actions du jeur
     * 
     * @return List<Action> la liste des actions
     */
    public List<Action> getActions() {
        return this.actions;
    }

    /**
     * cette methode retourne le scanner du jeu
     * 
     * @return Scanner le scanner du jeu
     */
    public Scanner getSc() {
        return this.sc;
    }

    /**
     * cette methode servent a modifier le scanner nous seras util dans la
     * simulation
     * 
     * @param newSc la nuvelle scanner
     */
    public void setSc(Scanner newSc) {
        this.sc = newSc;
    }

    /**
     * cette methode permet de gerer la construction de batiments pour un joueur
     * dans
     * le plateau
     * 
     * @param pos    la position a laquelle construire
     * @param joueur le joueur qui construis
     * @param bat    le batiment que le joueur construits
     */
    public boolean construire(Position pos, Joueur joueur, Batiment bat) {
        Tuile tuile = this.plateau.getTuile(pos);
        if (tuile instanceof Mer) {
            System.out.println("construction impossible sur un tuile Mer");
            return false;
        }
        if (!tuile.getBatiment()) {
            this.relationTuileBatiment.put(tuile, bat);
            joueur.getBatiments().add(bat);
            tuile.setBatiment(true);
            bat.setTuile(tuile);
            return true;
        }
        return false;
    }

    /**
     * cette methode permet de faire une remplcament d'une batiment dans le jeu
     * que sa soit un port ou autre chose
     * 
     * @param tuile  le tuile dans laquelle on veux replacer le batiment
     * @param newBat nouvelle batiment
     * @param joueur le joueur qui effectue le remplacement de son batiment
     */
    public boolean replaceBatiment(Tuile tuile, Batiment newBat, Joueur joueur) {
        if (this.relationTuileBatiment.containsKey(tuile)){
            Batiment bat = this.relationTuileBatiment.get(tuile);
            this.relationTuileBatiment.remove(tuile);
            joueur.getBatiments().remove(bat);
            tuile.setBatiment(false);
            this.construire(tuile.getPosition(), joueur, newBat);
            return true;
        }
       return false;
    }

    /**
     * return les iles du jeu
     * 
     * @return iles les iles du jeu
     */
    public Ile getIle() {
        return this.iles;
    }

    /**
     * Cette méthode permet de choisir une action parmi les actions disponibles.
     * 
     * @param joueur Joueur qui doit choisir une action
     * @return L'action choisie
     */
    public Action choisirAction(Joueur joueur) {
        System.out.println(joueur.getName() + " Veuillez choisir une action");
        int choix = -1;
        for (int i = 0; i < this.actions.size(); i++) {
            System.out.println(i + 1 + " : " + this.actions.get(i));
        }
        if (this.estEnSimulation) {
            choix = this.random.nextInt(this.actions.size()) + 1;
            System.out.println("choix: " + choix);
        } else {
            while (true) {
                System.out.print("Choisissez une action (1 à " + (this.actions.size()) + ") : ");

                if (sc.hasNextInt()) {
                    choix = sc.nextInt();
                    sc.nextLine();
                    if (choix >= 1 && choix <= this.actions.size()) {
                        break;
                    } else {
                        System.out.println("Veuillez entrer un nombre valide dans l’intervalle.");
                    }
                } else {
                    System.out.println("Entrée invalide. Veuillez saisir un nombre entier.");
                    sc.next();
                }
            }
        }
        return this.actions.get(choix - 1);
    }

    /**
     * cette methode permet de construire les armées au debut du jeu
     * pour chaque joueur
     * initilise la construction des batiments dans les deux sens
     * 
     * @throws NoValidTuilePlacementException
     */
    public void initialiseJeu() throws NoValidTuilePlacementException {
        System.out.println("Premiere Tour de construction");
        for (Joueur joueur : this.joueurs) {
            Batiment bat;
            if (this instanceof Ares) {
                bat = new Armée(1, (JoueurAres) joueur);
            } else {
                bat = new Ferme((JoueurDemeter) joueur);
            }
            Position position = this.choisisTuile(joueur);
            if (position == null) {
                System.out.println("Aucune tuile disponible");
                return;
            }
            this.construire(position, joueur, bat);
        }
        System.out.println("Deuxieme Tour de construction");
        for (int i = this.joueurs.size() - 1; i >= 0; i--) {
            Joueur joueur = this.joueurs.get(i);
            Batiment bat;
            if (this instanceof Ares) {
                bat = new Armée(1, (JoueurAres) joueur);
            } else {
                bat = new Ferme((JoueurDemeter) joueur);
            }
            Position position = this.choisisTuile(this.joueurs.get(i));
            if (position == null) {
                System.out.println("Aucune tuile disponible");
                return;
            }
            this.construire(position, this.joueurs.get(i), bat);
        }
    }

    /**
     * cette methode sert a modifier les iles en cas de modification sur le plateau
     * necesssaire pour les teste
     * 
     * @param newIle a nouvelle ile
     */
    public void setIle(Ile newIle) {
        this.iles = newIle;
    }
}
