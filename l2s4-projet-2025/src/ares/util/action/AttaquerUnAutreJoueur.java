package ares.util.action;

import ares.Ares;
import ares.util.batiment.*;
import ares.util.joueur.JoueurAres;
import java.util.*;

import util.action.Action;
import util.batiment.Batiment;
import util.joueur.Joueur;
import util.plateau.outils.combat.De;
import util.plateau.outils.ressource.Ressource;
import util.plateau.outils.tuile.Tuile;

/**
 * Classe permettant à un joueur d'attaquer un autre joueur dans le jeu Ares.
 */
public class AttaquerUnAutreJoueur extends Action {
    Scanner sc = new Scanner(System.in);

    /**
     * Constructeur de l'action d'attaque.
     * 
     * @param jeu Instance du jeu Ares.
     * @throws IllegalArgumentException si le jeu est null.
     */
    public AttaquerUnAutreJoueur(Ares jeu) {
        super(null, jeu);
        if (jeu == null) {
            throw new IllegalArgumentException("Le jeu ne peut pas être null");
        }
    }

    /**
     * exécuter l'attaque sur un autre joueur.
     * 
     * @param joueur Le joueur initiant l'attaque.
     * @throws Exception En cas d'erreur durant l'exécution.
     */
    @Override
    public void act(Joueur joueur) throws Exception {
        List<Tuile> armees = super.getJeu().getTuileType(new Armée(1, (JoueurAres) joueur), joueur);
        List<Tuile> camps = super.getJeu().getTuileType(new Camp(1, (JoueurAres) joueur), joueur);
        // verification que le joueur dispose d'arme ou de camps
        if (armees.isEmpty() && camps.isEmpty()) {
            System.out.println("Vous n'avez pas d'armée ou de camp pour attaquer.");
            super.displayNoRessource();
            return;
        }
        // fait lui choisir un autre joueur
        List<Joueur> joueurs = super.getJeu().getJoueursSansJ(joueur);
        if (joueurs.isEmpty()) {
            System.out.println("aucune joueur a attaquer");
            return;
        }
        for (int i = 0; i < joueurs.size(); i++) {
            System.out.println((i + 1) + ". " + joueurs.get(i).getName());
        }
        Joueur cible = joueurs.get(super.saisisIntIntervalle(1, joueurs.size())-1);
        System.out.println("Choisissez l'unité pour attaquer :");
        System.out.println("1. Armée\n2. Camp");
        System.out.print("choix :");
        int choix2 = super.saisisIntIntervalle(1, 2);
        if (choix2 == 1 && !armees.isEmpty()) {
            attaque(armees, joueur, cible, super.getJeu().getTuileType(new Armée(1, (JoueurAres) cible), cible));
        } else if (choix2 == 2 && !camps.isEmpty()) {
            attaque(camps, joueur, cible, super.getJeu().getTuileType(new Camp(1, (JoueurAres) cible), cible));
        } else {
            System.out.println("Vous n'avez pas de batiments pour attaquer un autre Joueur");
            super.displayNoRessource();
            return;
        }
        super.displayActionEffectue();
    }

    /**
     * Retourne une description de l'action.
     * 
     * @return Une chaîne de caractères représentant l'action.
     */
    @Override
    public String toString() {
        return "Attaquer un autre joueur";
    }

    /**
     * Méthode gérant l'attaque entre le joueur et sa cible.
     * 
     * @param armees      Liste des tuiles contenant les armées du joueur attaquant.
     * @param joueur      Le joueur qui initie l'attaque.
     * @param cible       Le joueur cible de l'attaque.
     * @param armeesCible Liste des tuiles contenant les armées du joueur cible.
     */
    private void attaque(List<Tuile> armees, Joueur joueur, Joueur cible, List<Tuile> armeesCible) {
        if (armeesCible.isEmpty()) {
            System.out.println("Le joueur cible n'a pas le meme type de batiment pour se défendre !");
            System.out.println("Vous pouvez choisir une ressource à lui prendre.");
            DonneRessource(joueur, cible);
            return;
        }
        Tuile armee = selectionnerArmee(joueur, armees);
        if (armee == null)
            return;
        Batiment bat = super.getJeu().getRelationTuileBatiment().get(armee);
        int nbGuerriersAttaque =bat.getDimension();

        Tuile armeeCible = selectionnerArmee(cible, armeesCible);
        if (armeeCible == null)
            return;

        Batiment batCible = super.getJeu().getRelationTuileBatiment().get(armeeCible);
        int nbGuerriersDefense = batCible.getDimension();

        int desAttaque = getNbDes(nbGuerriersAttaque);
        int desDefense = getNbDes(nbGuerriersDefense);

        if (((JoueurAres) joueur).utiliserArmeSecrete()) {
            desAttaque++;
            System.out.println(joueur.getName() + " utilise une arme secrète et gagne un dé supplémentaire !");
        }

        De de1 = new De((JoueurAres) joueur, desAttaque);
        De de2 = new De((JoueurAres) cible, desDefense);
        int res1 = de1.lancerDes();
        int res2 = de2.lancerDes();

        System.out.println(joueur.getName() + " a obtenu " + res1);
        System.out.println(cible.getName() + " a obtenu " + res2);

        if (res1 > res2) {
            System.out.println(joueur.getName() + " a gagné !");
            reduireGuerriersOuDétruire(batCible, armeeCible);
        } else if (res1 < res2) {
            System.out.println(cible.getName() + " a gagné !");
            reduireGuerriersOuDétruire(bat, armee);
        } else {
            System.out.println("Match nul ! ");

            if ( bat.getDimension()<= 0) {
                System.out.println(joueur.getName() + " a perdu son armée !");
                Batiment arm = super.getJeu().getRelationTuileBatiment().get(armee);
                super.getJeu().getRelationTuileBatiment().remove(armee);
                joueur.getBatiments().remove(arm);
            }
            if ( batCible.getDimension() <= 0) {
                System.out.println(cible.getName() + " a perdu son armée !");
                Batiment arm = super.getJeu().getRelationTuileBatiment().get(armee);
                super.getJeu().getRelationTuileBatiment().remove(armeeCible);
                cible.getBatiments().remove(arm);
            }
        }
    }

    /**
     * getter du nombre de dés à lancer selon le nombre de guerriers.
     * 
     * @param nbGuerriers Nombre de guerriers en jeu.
     * @return Nombre de dés à lancer.
     */
    private int getNbDes(int nbGuerriers) {
        if (nbGuerriers >= 8)
            return 3;
        if (nbGuerriers >= 4)
            return 2;
        return 1;
    }

    /**
     * sélection d'une armée parmi celles disponibles.
     * Affiche la liste des armées du joueur avec leur nombre de guerriers.
     *
     * @param joueur Le joueur qui doit sélectionner une armée.
     * @param armees La liste des tuiles contenant les armées du joueur.
     * @return La tuile sélectionnée contenant l'armée, ou null si aucune sélection
     *         valide n'est effectuée.
     */
    private Tuile selectionnerArmee(Joueur joueur, List<Tuile> armees) {
        System.out.println(joueur.getName() + ", choisissez votre armée :");
        for (int i = 0; i < armees.size(); i++) {
            Batiment bat = super.getJeu().getRelationTuileBatiment().get(armees.get(i));
            System.out.println((i + 1) + ". " + bat.toString() + " (" +  bat.getDimension() + " guerriers)" +
                    " a la position " + bat.getTuile().getPosition().toString());
        }

        System.out.print("Votre choix : ");
        int choix = super.saisisIntIntervalle(1, armees.size())-1;
        return armees.get(choix);
    }

    /**
     * Réduit le nombre de guerriers d'une armée ou détruit l'armée si elle n'a plus
     * qu'un seul guerrier.
     * 
     * @param batiment Le bâtiment associé à l'armée (doit être une instance de
     *                 Armée).
     * @param tuile    La tuile où se trouve l'armée.
     */
    private void reduireGuerriersOuDétruire(Batiment batiment, Tuile tuile) {
        if ( batiment.getDimension() > 1) {
            batiment.addDimension(-1);
            System.out.println("Un guerrier a été perdu !");
        } else {
            super.getJeu().removeBatiment(tuile);
            batiment.getProprietaire().getBatiments().remove(batiment);
            System.out.println("L'armée ou le camp de "+ batiment.getProprietaire().getName()+ " a été détruit !");
        }
    }

    /**
     * Permet à un joueur de prendre une ressource d'un autre joueur.
     * Si le joueur cible ne possède aucune ressource, l'action est annulée.
     *
     * @param j1 Le joueur qui reçoit la ressource.
     * @param j2 Le joueur qui perd la ressource.
     */
    private void DonneRessource(Joueur j1, Joueur j2) {
        Map<Ressource, Integer> ressourcesJ2 = j2.getRessources();
        // Filtrer les ressources disponibles
        List<Ressource> disponibles = new ArrayList<>();
        for (Map.Entry<Ressource, Integer> entry : ressourcesJ2.entrySet()) {
            if (entry.getValue() > 0) {
                disponibles.add(entry.getKey());
            }
        }
        // Vérification : est-ce que j2 a au moins une ressource > 0 ?
        if (disponibles.isEmpty()) {
            System.out.println(j2.getName() + " n'a pas de ressources disponibles à donner.");
            return;
        }
        // Affichage
        System.out.println(j2.getName() + " possède les ressources suivantes :");
        for (int i = 0; i < disponibles.size(); i++) {
            Ressource r = disponibles.get(i);
            System.out.println((i + 1) + " : " + r + " (" + ressourcesJ2.get(r) + ")");
        }
        int choix=super.saisisIntIntervalle(1, disponibles.size());
        Ressource ressourceChoisie = disponibles.get(choix-1);
        int val = j2.getRessources().get(ressourceChoisie);
        j1.addRessource(ressourceChoisie, j2.getRessources().get(ressourceChoisie));
        j2.addRessource(ressourceChoisie, -j2.getRessources().get(ressourceChoisie));
        System.out.println("✔️ Vous avez pris "+val +" "+ressourceChoisie + " à " + j2.getName());
    }

}
