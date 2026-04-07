package util.action;

import java.util.HashMap;
import java.util.List;
import java.util.Random;
import java.util.Scanner;
import util.batiment.NoValidTuilePlacementException;
import util.jeu.Jeu;
import util.joueur.Joueur;
import util.plateau.outils.ressource.Ressource;
import util.plateau.outils.tuile.Tuile;

public abstract class Action {
    protected Scanner sc;
    protected HashMap<Ressource, Integer> prerequis;
    protected Jeu jeu;
    protected Random random = new Random();

    /**
     * constructeur de la classe Action
     * 
     * @param prerequis les ressources necessaires pour effectuer l'action
     * @param jeu       le jeu dans lequel l'action est effectuee
     */
    public Action(HashMap<Ressource, Integer> prerequis, Jeu jeu) {
        this.prerequis = prerequis;
        this.jeu = jeu;
        this.sc = new Scanner(System.in);
    }

    /**
     * cette methode permet de retourner les ressources necessaires pour effectuer
     * l'action
     * 
     * @return HashMap<Ressource, Integer> les ressources necessaires pour effectuer
     *         l'action
     */
    public HashMap<Ressource, Integer> getPrerequis() {
        return this.prerequis;
    }

    /**
     * cette methode permet de retourner le jeu dans lequel l'action est effectuee
     * 
     * @return Jeu le jeu dans lequel l'action est effectuee
     */
    public Jeu getJeu() {
        return this.jeu;
    }

    /**
     * cette methode permet de verifier si le joueur a les ressources necessaires
     * pour effectuer l'action
     * 
     * @return boolean true si le joueur a les ressources necessaires pour effectuer
     *         l'action, false sinon
     */
    public boolean displayNoRessource() {
        System.out.println("Ressource Insuffisante pour effectuer l'action ❌❌❌");
        System.out.println();
        return false;
    }

    /**
     * cette methode permet d'afficher que l'action a ete effectuee
     * 
     * @return boolean true si l'action a ete effectuee, false sinon
     */
    public boolean displayActionEffectue() {
        System.out.println("Action effectuée avec succès 👌👌👌");
        System.out.println();
        return true;
    }

    /**
     * cette methode permet de verifier si le joueur a les ressources necessaires
     * pour effectuer l'action
     * 
     * @param joueur le joueur qui effectue l'action
     * @return boolean true si le joueur a les ressources necessaires pour effectuer
     *         l'action, false sinon
     */
    public boolean aPrerequis(Joueur joueur) {
        if (this.prerequis != null) {
            for (Ressource ressource : this.prerequis.keySet()) {
                if (joueur.getRessources().get(ressource) < this.prerequis.get(ressource)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * cette methode permet de retirer les ressources necessaires pour effectuer
     * l'action
     * 
     * @param joueur le joueur qui effectue l'action
     * @return boolean true si le joueur a les ressources necessaires pour effectuer
     *         l'action, false sinon
     */
    public void retireRessource(Joueur joueur) {
        for (Ressource ressource : this.prerequis.keySet()) {
            joueur.getRessources().put(ressource,
                    joueur.getRessources().get(ressource) - this.prerequis.get(ressource));
        }
    }

    /**
     * cette methode permet d'effectuer l'action
     * 
     * @throws NoValidTuilePlacementException
     */
    public abstract void act(Joueur joueur) throws Exception;

    /**
     * cette methode fait une description de l'action
     * 
     * @return String la description de l'action
     */
    public abstract String toString();

    /**
     * cette methode permet d'afficher les ressources necessaires pour effectuer
     * l'action
     * 
     * @return String les ressources necessaires pour effectuer l'action
     */
    public String displayPrerequis() {
        String res = " ( ";
        int size = this.prerequis.size();
        int count = 0;
        for (Ressource ressource : this.prerequis.keySet()) {
            res += ressource + " : " + this.prerequis.get(ressource);
            count++;
            if (count < size) {
                res += ", ";
            }
        }
        return res + " )";
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
     * cette methode permet de modifier le scanner des actions nous seras utiles
     * dans les teste et les simulation
     * 
     * @param newSc la nouvelle scanner a placer
     */
    public void setSc(Scanner newSc) {
        this.sc = newSc;
    }

    /**
     * cette methode retourne le scanner des actions
     * 
     * @return scanner les scanner
     */
    public Scanner getSc() {
        return this.sc;
    }

    public Tuile chosisTuileReplace(Joueur joueur, List<Tuile> tuiles) {
        System.out.println("Choisissez la tuile à remplacer");
        for (int i = 0; i < tuiles.size(); i++) {
            System.out.println((i + 1) + ". " + tuiles.get(i).getPosition().toString());
        }
        System.out.print("Choisissez une tuile : ");
        int tuile;
        while (!this.sc.hasNextInt() || (tuile = this.sc.nextInt()) < 0) {
            System.out.println("Erreur : Veuillez entrer un entier positif.");
            System.out.print("Tuile : ");
            sc.nextLine();
        }
        tuile = this.jeu.choixInvalide(tuile, 1, tuiles.size()) - 1;
        Tuile tuil = tuiles.get(tuile);
        return tuil;
    }

    /**
     * cette methode permet de gerer efficacement a saisise de valeur
     * 
     * @param init le minimale du nombre qui doit eter saisis
     * @param fin  le mximale du nombre qui doit etre saisis
     * @return la valeur choisis
     */
    public int saisisIntIntervalle(int init, int fin) {
        System.out.print("Saisissez le nombre : ");
        int saisis;
        if (this.jeu.getEstEnSimulation()) {
            saisis = this.random.nextInt(fin - init + 1) + init;
            System.out.println("saisis : "+saisis);
        } else {
            while (true) {
                if (!this.sc.hasNextInt()) {
                    System.out.println("Erreur : Veuillez entrer un entier.");
                    System.out.print("Saisis : ");
                    this.sc.nextLine();
                } else {
                    saisis = this.sc.nextInt();
                    if (saisis >= init && saisis <= fin) {
                        break;
                    } else {
                        System.out.println("Erreur : Veuillez entrer un entier compris entre " + init + " et " + fin);
                        System.out.print("Saisis : ");
                    }
                }
            }
        }
        return saisis;
    }

    public Random getRandom(){
        return this.random;
    }
}
