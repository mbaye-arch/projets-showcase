package ares.util.action;

import ares.Ares;
import ares.util.batiment.Armée;
import ares.util.joueur.JoueurAres;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import util.plateau.outils.position.Position;
import util.plateau.outils.tuile.Foret;
import util.plateau.outils.tuile.Tuile;
import util.joueur.Joueur;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.Scanner;

import static org.junit.jupiter.api.Assertions.*;

class AttaquerUnAutreJoueurTest {
    private Ares jeu;
    private JoueurAres joueur1;
    private JoueurAres joueur2;
    private AttaquerUnAutreJoueur action;
    private final ByteArrayOutputStream outContent = new ByteArrayOutputStream();

    @BeforeEach
    void setUp() {
        System.setOut(new PrintStream(outContent));
        jeu = new Ares(10, 10);
        joueur1 = new JoueurAres("Alice");
        joueur2 = new JoueurAres("Bob");
        jeu.ajouterJoueur(joueur1);
        jeu.ajouterJoueur(joueur2);
        action = new AttaquerUnAutreJoueur(jeu);
    }

    @Test
    void testActWithoutArmyOrCamp() throws Exception {
        action.act(joueur1);
        assertTrue(outContent.toString().contains("Vous n'avez pas d'armée ou de camp pour attaquer."));
    }

    @Test
    void testActNoOtherPlayers() throws Exception {
        jeu.getJoueurs().remove(joueur2);
        Armée arme = new Armée(5, joueur1);
        Tuile tuile = new Foret(new Position(0, 0));
        jeu.getPlateau().setTuile(tuile);
        jeu.getRelationTuileBatiment().put(tuile, arme);
        joueur1.getBatiments().add(arme);
        action.act(joueur1);
        assertTrue(outContent.toString().contains("aucune joueur a attaquer"));
    }

    @Test
    void testAttackWhenTargetHasNoArmy() throws Exception {
        // Préparer armée pour joueur1
        Tuile tuile1 = new Foret(new Position(0, 0));
        jeu.getPlateau().setTuile(tuile1);
        Armée armee1 = new Armée(1, joueur1);
        jeu.getRelationTuileBatiment().put(tuile1, armee1);
        joueur1.getBatiments().add(armee1);

        // joueur2 sans armée
        joueur2.getBatiments().clear();

        // Lui donner une ressource pour simuler DonneRessource
        joueur2.addRessource(Joueur.BLE, 2);

        // Simuler les choix
        action.setSc(new Scanner("1\n1\n1\n")); // choix du joueur + armée + ressource

        action.act(joueur1);

        assertTrue(outContent.toString().contains("✔️ Vous avez pris"));
    }

    @Test
    void testToStringMethod() {
        assertEquals("Attaquer un autre joueur", action.toString());
    }
}
