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

public class ConstruireArméeTest {
    private ConstruireArmée action;
    private JoueurAres joueur;
    private Jeu jeu;
    private final ByteArrayOutputStream outContent = new ByteArrayOutputStream();

    @BeforeEach
    public void setUp() {
        System.setOut(new PrintStream(outContent));
        jeu = new Ares(10, 10);
        joueur = new JoueurAres("Alice");
        action = new ConstruireArmée((Ares) jeu);
        jeu.ajouterJoueur(joueur);
    }

    @Test
    public void testEquals() {
        ConstruireArmée sameAction = new ConstruireArmée((Ares) jeu);
        assertEquals(action, sameAction);
        Object differentObject = new Object();
        assertNotEquals(action, differentObject);
    }

    @Test
    public void testActWithSufficientResources() throws Exception {
        joueur.addRessource(Joueur.BOIS, 1);
        joueur.addRessource(Joueur.MOUTON, 1);
        joueur.addRessource(Joueur.BLE, 1);
        // Simuler les positions vides
        Tuile tuile = new Foret(new Position(0, 0));
        jeu.getPlateau().setTuile(tuile);
        // Simuler les choix de l'utilisateur
        jeu.setSc(new Scanner("0\n0\n"));
        //j'ajoute 3 guerrier il m'en reste 27
        action.setSc(new Scanner("3\n"));
        action.act(joueur);
        assertEquals(0, joueur.getRessources().get(Joueur.BOIS));
        assertEquals(0, joueur.getRessources().get(Joueur.MOUTON));
        assertEquals(0, joueur.getRessources().get(Joueur.BLE));
        // 3 guerrier ajouter 
        assertEquals(27, joueur.getRessources().get(JoueurAres.GUERRIER));
        assertTrue(joueur.getBatiments().get(0) instanceof Armée);
        assertTrue(joueur.getBatiments().get(0).getDimension() == 3);
        assertTrue(jeu.getRelationTuileBatiment().containsValue(new Armée(3, joueur)));
    }

    @Test
    public void testActWithInsufficientResources() throws Exception {
        action.act(joueur);
        assertEquals(0, joueur.getRessources().get(Joueur.BOIS));
        assertEquals(0, joueur.getRessources().get(Joueur.MOUTON));
        assertEquals(0, joueur.getRessources().get(Joueur.BLE));
        assertEquals(30, joueur.getRessources().get(JoueurAres.GUERRIER));
        // Vérifier la sortie dans le terminal
        assertTrue(joueur.getBatiments().size()==0);
    }

    @Test
    public void testToString() {
        String expected = "Construire une armée";
        assertTrue(action.toString().contains(expected));
    }
    
}