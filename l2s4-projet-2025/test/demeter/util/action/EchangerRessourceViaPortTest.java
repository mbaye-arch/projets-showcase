package demeter.util.action;

import demeter.Demeter;
import util.batiment.Port;
import demeter.util.joueur.JoueurDemeter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import util.joueur.Joueur;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import java.util.Scanner;

import static org.junit.jupiter.api.Assertions.*;

public class EchangerRessourceViaPortTest {
    private EchangerRessourceViaPort action;
    private JoueurDemeter joueur;
    private Demeter jeu;
    private final ByteArrayOutputStream outContent = new ByteArrayOutputStream();

    @BeforeEach
    public void setUp() {
        System.setOut(new PrintStream(outContent));
        jeu = new Demeter(10, 10);
        joueur = new JoueurDemeter("Alice");
        action = new EchangerRessourceViaPort(jeu);
        jeu.ajouterJoueur(joueur);
    }

    @Test
    public void testActWithPort() {
        // Ajouter un port au joueur
        Port port = new Port(joueur);
        joueur.getBatiments().add(port);
        joueur.addRessource(Joueur.BOIS, 2);

        // Simuler les choix de l'utilisateur
        action.setSc(new Scanner("0\n1\n2\n"));

        action.act(joueur);

        assertEquals(1, joueur.getRessources().get(Joueur.BOIS));
        assertTrue(outContent.toString().contains("Echange de ressources via port"));
    }

    @Test
    public void testActWithoutPort() {
        // Simuler les choix de l'utilisateur
        action.setSc(new Scanner("0\n1\n2\n"));

        action.act(joueur);
        // aucune ressource echange pas de port 
        assertEquals(0, joueur.getRessources().get(Joueur.BOIS));
    }

    @Test
    public void testToString() {
        assertEquals("Echange de ressources via un port gratuit 1 Ressource pour 2", action.toString());
    }
}