package ares.util.action;

import ares.Ares;
import ares.util.batiment.Armée;
import ares.util.joueur.JoueurAres;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import util.jeu.Jeu;
import util.joueur.Joueur;
import util.plateau.outils.position.Position;
import util.plateau.outils.tuile.Foret;
import util.plateau.outils.tuile.Tuile;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.Scanner;

import static org.junit.jupiter.api.Assertions.*;

public class AjouterGuerrierTest {
    private AjouterGuerrier action;
    private Joueur joueur;
    private Jeu jeu;
    private final ByteArrayOutputStream outContent = new ByteArrayOutputStream();

    @BeforeEach
    public void setUp() {
        System.setOut(new PrintStream(outContent));
        jeu = new Ares(10, 10);
        joueur = new JoueurAres("Alice");
        action = new AjouterGuerrier((Ares)jeu);
        jeu.ajouterJoueur(joueur);
        jeu.addActions(action);
    }

    @Test
    public void testEquals() {
        AjouterGuerrier sameAction = new AjouterGuerrier((Ares) jeu);
        assertEquals(action, sameAction);

        Object differentObject = new Object();
        assertNotEquals(action, differentObject);
    }

    @Test
    public void testActWithSufficientResources() throws Exception {
        // Simuler les tuiles avec des armées
        Tuile tuile = new Foret(new Position(0, 0));
        Tuile tuile2 = new Foret(new Position(1, 0));
        Armée armée = new Armée(1, (JoueurAres) joueur);
        jeu.getPlateau().setTuile(tuile);
        jeu.getPlateau().setTuile(tuile2);
        jeu.construire(new Position(0, 0), joueur, armée);
        // Simuler les choix de l'utilisateur
        action.setSc(new Scanner("1\n1\n3"));
        action.act(joueur);
        assertEquals(joueur.getRessources().get(JoueurAres.GUERRIER),27);
        assertEquals(joueur.getBatiments().size(),1);
        assertEquals(armée.getNbGuerrier(), 4);
        assertTrue(joueur.getBatiments().get(0).equals(armée));
    }

    @Test
    public void testToString() {
        String expected = "Ajouter des Guerrier à une armée ou un camp";
        assertTrue(action.toString().contains(expected));
    }
}