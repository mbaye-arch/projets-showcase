package ares;

import ares.util.joueur.JoueurAres;
import util.joueur.objectif.Objectif;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import util.action.Action;
import util.action.ConstruirePort;
import util.action.NeRienFaire;
import util.batiment.NoValidTuilePlacementException;
import util.plateau.outils.position.Position;
import util.plateau.outils.tuile.Foret;

import java.util.Scanner;

import static org.junit.jupiter.api.Assertions.*;

public class AresTest {

    private Ares jeu;
    private JoueurAres joueur;

    @BeforeEach
    public void setUp() {
        jeu = new Ares(10, 10);
        joueur = new JoueurAres("Alice");
        jeu.ajouterJoueur(joueur);
    }

    @Test
    @DisplayName("Création d'un jeu Ares avec un plateau 10x10")
    public void testCreationAres() {
        assertNotNull(jeu);
        assertEquals(10, jeu.getPlateau().getLigne());
        assertEquals(10, jeu.getPlateau().getColonne());
    }

    @Test
    @DisplayName("Initialisation du jeu - placement des bâtiments")
    public void testInitialiseJeu() throws NoValidTuilePlacementException {
        jeu.getPlateau().setTuile(new Foret(new Position(0, 0)));
        jeu.getPlateau().setTuile(new Foret(new Position(0, 1)));
        jeu.sc = new Scanner("0\n0\n\n0\n1\n");
        jeu.initialiseJeu();
        assertEquals(2, jeu.getRelationTuileBatiment().size());
    }

    @Test
    @DisplayName("Génération d'objectifs pour un joueur")
    public void testGenereObjectifsJoueur() {
        jeu.genereObjectifsJoueur();
        Objectif objectif = joueur.getObjectif();
        assertNotNull(objectif, "Chaque joueur doit avoir un objectif après génération.");
    }

    @Test
    @DisplayName("Choix d'une action pour un joueur")
    public void testChoisirAction() {
        Action action1 = new NeRienFaire();
        Action action2 = new ConstruirePort(jeu);
        jeu.getActions().add(action1);
        jeu.getActions().add(action2);
        jeu.sc = new Scanner("1\n"); // Choisir la deuxième action
        Action chosenAction = jeu.choisirAction(joueur);
        assertNotNull(chosenAction);
    }

    @Test
    @DisplayName("Vérification du nombre de tours au démarrage")
    public void testGetNbTours() {
        assertEquals(1, jeu.getNbTours());
    }
}
