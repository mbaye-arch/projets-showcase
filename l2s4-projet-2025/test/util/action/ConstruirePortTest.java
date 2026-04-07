package util.action;

import ares.Ares;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import util.batiment.Port;
import util.jeu.Jeu;
import util.joueur.Joueur;
import util.plateau.outils.position.Position;
import util.plateau.outils.tuile.Foret;
import ares.util.joueur.JoueurAres;
import java.util.Scanner;

import static org.junit.jupiter.api.Assertions.*;

public class ConstruirePortTest {
    private ConstruirePort action;
    private JoueurAres joueur;
    private Jeu jeu;

    @BeforeEach
    public void setUp() {
        //System.setOut(new PrintStream(outContent));
        jeu = new Ares(10, 10);
        joueur = new JoueurAres("Alice");
        action = new ConstruirePort(jeu);
        jeu.ajouterJoueur(joueur);
        jeu.addActions(action);
    }

    @Test
    public void testEquals() {
        ConstruirePort sameAction = new ConstruirePort(jeu);
        assertEquals(action, sameAction);

        Object differentObject = new Object();
        assertNotEquals(action, differentObject);
    }

    @Test
    public void testActWithSufficientResources() throws Exception {
        // place une tuile a la position 0,0
        jeu.getPlateau().setTuile(new Foret(new Position(0, 0)));
        joueur.addRessource(Joueur.BOIS, 1);
        joueur.addRessource(Joueur.MOUTON, 2);
        // Simuler les choix de l'utilisateur
        jeu.setSc(new Scanner("0\n0\n"));
        action.act(joueur);
        assertEquals(0, joueur.getRessources().get(Joueur.BOIS));
        assertEquals(0, joueur.getRessources().get(Joueur.MOUTON));
        assertTrue(jeu.getRelationTuileBatiment().containsValue(new Port(joueur)));
        assertTrue(joueur.getBatiments().size()==1);
    }
    @Test
    public void testToString() {
        assertTrue(action.toString().contains("Construire un port"));
    } 
    
    @Test
    public void testActWithInsufficientResources() throws Exception {
        action.act(joueur);
        assertEquals(0, joueur.getRessources().get(Joueur.BOIS));
        assertEquals(0, joueur.getRessources().get(Joueur.MOUTON));
        //aucune port construit donc batiment vide pour le joueur
        assertTrue(joueur.getBatiments().isEmpty());
        assertTrue(jeu.getRelationTuileBatiment().isEmpty());
    }

}