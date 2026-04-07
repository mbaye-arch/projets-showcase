package util.joueur;

import java.util.*;
import util.batiment.Batiment;
import util.plateau.outils.ressource.*;

/**
 * cette classe represente un joueur abstraite
 */
public abstract class Joueur {
    // les ressources du jeu disponible pour tout les joueurs
    public static final Ressource MOUTON = new Mouton();
    public static final Ressource BOIS = new Bois();
    public static final Ressource MINERAIS = new Minerais();
    public static final Ressource BLE = new Ble();
    protected String name;
    protected List<Batiment> batiments;
    protected Map<Ressource, Integer> ressources;

    /**
     * contructeur de la classe
     * 
     * @param name le nom du joueur
     */
    public Joueur(String name) {
        this.name = name;
        this.ressources = new HashMap<>();
        this.batiments = new ArrayList<>();
        this.ressources.put(MOUTON, 0);
        this.ressources.put(BOIS, 0);
        this.ressources.put(MINERAIS, 0);
        this.ressources.put(BLE, 0);
    }

    /**
     * cette methode retourne les ressources du joueur
     * 
     * @return HashMap<Ressource, Integer> les ressources du joueur
     */
    public Map<Ressource, Integer> getRessources() {
        return this.ressources;
    }

    /**
     * cette methode retourne les batiments du joueur
     * 
     * @return List<Batiment> les batiments du joueur
     */
    public List<Batiment> getBatiments() {
        return this.batiments;
    }

    /**
     * name getter
     * 
     * @return the name of this joueur
     */
    public String getName() {
        return this.name;
    }

    /**
     * methode equals pour comparer deux joueurs
     * 
     * @param o l'objet a comparer
     * @return boolean true si les deux joueurs sont egaux, false sinon
     */
    public boolean equals(Object o) {
        if (!(o instanceof Joueur)) {
            return false;
        } else {
            Joueur other = (Joueur) o;
            return this.name.equals(other.getName()) && this.ressources.equals(other.getRessources()) &&
                    this.batiments.equals(other.getBatiments());
        }
    }

    /**
     * cette methode retourne en chaine de caractere avec la quantite
     * du stock de ressources du joueur
     * 
     * @return String les stock de ressources
     */
    public String toStringStockRessource() {
        String res = "";
        for (Ressource r : this.ressources.keySet()) {
            res += r.toString() + " : " + this.ressources.get(r) + ",  ";
        }
        return res;
    }

    /**
     * methode display pour joueur
     */
    public void display() {
        System.out.println("#### Joueur --> " + this.name + "  #### ");
        System.out.println("Stock de ressources : " + this.toStringStockRessource());
    }

    /**
     * methode toString pour joueur
     * 
     * @return String le nom du joueur
     * 
     */
    @Override
    public String toString() {
        return this.name;
    }

    /**
     * cette methode permet de retirer une ressource du stock du joueur
     * 
     * @param ressource la ressource a retirer
     * @param quantite  la quantite de la ressource a retirer
     */
    public void addRessource(Ressource ressource, int quantite) {
        for (Ressource r : this.ressources.keySet()) {
            if (r.equals(ressource)) {
                this.ressources.put(r, this.ressources.get(r) + quantite);
            }
        }
    }

    /**
     * cette methode permet de supprimer des ressources du stock du joueur
     * 
     * @param ressource la ressource a supprimer
     * @param quantite  la quantite de la ressource a supprimer
     */
    public void removeRessource(Ressource ressource, int quantite) {
        for (Ressource r : this.ressources.keySet()) {
            if (r.equals(ressource)) {
                this.ressources.put(r, this.ressources.get(r) - quantite);
            }
        }
    }
    /**
     * n'a plus de batiment ni de ressource pour eter supprime du jeu 
     * @return boolean vari ou faux
     */
    public boolean naPlusDeBatRessource(){
        for (int quantite : this.ressources.values()) {
            if (quantite > 0) {
                return false;
            }
        }        
        return this.batiments.isEmpty();
    }
}