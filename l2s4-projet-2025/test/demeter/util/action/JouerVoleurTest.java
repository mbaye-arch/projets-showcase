package demeter.util.action;

import demeter.Demeter;
import demeter.util.joueur.JoueurDemeter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import util.joueur.Joueur;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.Scanner;

import static org.junit.jupiter.api.Assertions.*;

public class JouerVoleurTest {
    private JouerVoleur action;
    private JoueurDemeter joueur;
    private JoueurDemeter joueurAVoler;
    private Demeter jeu;
    private final ByteArrayOutputStream outContent = new ByteArrayOutputStream();

    @BeforeEach
    public void setUp() {
        System.setOut(new PrintStream(outContent));
        jeu = new Demeter(10, 10);
        joueur = new JoueurDemeter("Alice");
        joueurAVoler = new JoueurDemeter("Bob");
        action = new JouerVoleur(jeu);
        jeu.ajouterJoueur(joueur);
        jeu.ajouterJoueur(joueurAVoler);
    }

    @Test
    public void testActWithSufficientResources() throws Exception {
        joueurAVoler.addRessource(Joueur.BOIS, 1);
        // Simuler les choix de l'utilisateur
        action.setSc(new Scanner("1\n1\n"));
        action.act(joueur);
        assertEquals(0, joueur.getRessources().get(JoueurDemeter.VOLEUR));
        assertEquals(1, joueur.getRessources().get(Joueur.BOIS));
        assertEquals(0, joueurAVoler.getRessources().get(Joueur.BOIS));
        assertTrue(outContent.toString().contains("Action effectuée avec succès"));
    }

    @Test
    public void testActWithInsufficientResources() throws Exception {
        joueur.getRessources().put(JoueurDemeter.VOLEUR, 0);
        System.out.println(joueur.getRessources());
        action.act(joueur);
        assertEquals(0, joueur.getRessources().get(JoueurDemeter.VOLEUR));
        assertEquals(0, joueur.getRessources().get(Joueur.BOIS));
    }

    @Test
    public void testToString() {
        assertEquals("Jouer le voleur", action.toString());
    }
}