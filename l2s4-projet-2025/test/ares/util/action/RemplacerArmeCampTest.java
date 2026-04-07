package ares.util.action;

import ares.Ares;
import ares.util.batiment.Armée;
import ares.util.batiment.Camp;
import ares.util.joueur.JoueurAres;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import util.joueur.Joueur;
import util.plateau.outils.position.Position;
import util.plateau.outils.tuile.Foret;
import util.plateau.outils.tuile.Tuile;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import java.util.Scanner;

import static org.junit.jupiter.api.Assertions.*;

public class RemplacerArmeCampTest {
    private RemplacerArmeCamp action;
    private JoueurAres joueur;
    private Ares jeu;
    private final ByteArrayOutputStream outContent = new ByteArrayOutputStream();

    @BeforeEach
    public void setUp() {
        System.setOut(new PrintStream(outContent));
        jeu = new Ares(10, 10);
        joueur = new JoueurAres("Alice");
        action = new RemplacerArmeCamp(jeu);
        jeu.ajouterJoueur(joueur);
    }

    @Test
    public void testEquals() {
        RemplacerArmeCamp sameAction = new RemplacerArmeCamp(jeu);
        assertEquals(action, sameAction);

        Object differentObject = new Object();
        assertNotEquals(action, differentObject);
    }

    @Test
    public void testActWithSufficientResources() throws Exception {
        joueur.addRessource(Joueur.BOIS, 2);
        joueur.addRessource(Joueur.MINERAIS, 3);
        // Simuler les tuiles avec des armées
        Tuile tuile = new Foret(new Position(0, 0));
        Armée armée = new Armée(1, joueur);
        jeu.getRelationTuileBatiment().put(tuile, armée);
        // Simuler les choix de l'utilisateur
        jeu.getPlateau().setTuile(tuile);
        action.setSc(new Scanner("\n0\n3\n"));
        action.act(joueur);
        assertEquals(0, joueur.getRessources().get(Joueur.BOIS));
        assertEquals(0, joueur.getRessources().get(Joueur.MINERAIS));
        /// laction a maarcher il m'en reste 27 geurrier
        assertEquals(27, joueur.getRessources().get(JoueurAres.GUERRIER));
        assertTrue(joueur.getBatiments().get(0) instanceof Camp);
        assertTrue(jeu.getRelationTuileBatiment().size()==1);
        assertTrue(jeu.getRelationTuileBatiment().containsValue(new Camp(4, joueur)));
    }

    @Test
    public void testActWithInsufficientResources() throws Exception {
        // sans ressources sa ne marche pas
        action.act(joueur);
        assertEquals(0, joueur.getRessources().get(Joueur.BOIS));
        assertEquals(0, joueur.getRessources().get(Joueur.MINERAIS));
        assertEquals(30, joueur.getRessources().get(JoueurAres.GUERRIER));
        // Vérifier la sortie dans le terminal
        assertTrue(joueur.getBatiments().size()==0);
    }

    @Test
    public void testToString() {
        String expected = "Remplacer une armée par un camp";
        assertTrue(action.toString().contains(expected));
    }
}