package demeter.util.action;

import demeter.Demeter;
import demeter.util.batiment.Ferme;
import demeter.util.joueur.JoueurDemeter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import util.joueur.Joueur;
import util.plateau.outils.position.Position;
import util.plateau.outils.tuile.Foret;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.Scanner;

import static org.junit.jupiter.api.Assertions.*;

public class ConstruireFermeTest {
    private ConstruireFerme action;
    private JoueurDemeter joueur;
    private Demeter jeu;
    private final ByteArrayOutputStream outContent = new ByteArrayOutputStream();

    @BeforeEach
    public void setUp() {
        System.setOut(new PrintStream(outContent));
        jeu = new Demeter(10, 10);
        joueur = new JoueurDemeter("Alice");
        action = new ConstruireFerme(jeu);
        jeu.ajouterJoueur(joueur);
        jeu.addActions(action);
    }

    @Test
    public void testEquals() {
        ConstruireFerme sameAction = new ConstruireFerme(jeu);
        assertEquals(action, sameAction);

        Object differentObject = new Object();
        assertNotEquals(action, differentObject);
    }

    @Test
    public void testActWithSufficientResources() throws Exception {
        joueur.addRessource(Joueur.BOIS, 1);
        joueur.addRessource(Joueur.MINERAIS, 1);
        jeu.getPlateau().setTuile(new Foret(new Position(0, 0)));
        jeu.setSc(new Scanner("0\n0\n"));
        action.act(joueur);
        assertEquals(0, joueur.getRessources().get(Joueur.BOIS));
        assertEquals(0, joueur.getRessources().get(Joueur.MINERAIS));
        assertTrue(jeu.getRelationTuileBatiment().size()==1);
    }

    @Test
    public void testActWithInsufficientResources() throws Exception {
        joueur.getRessources().put(Joueur.BOIS, 0);
        joueur.getRessources().put(Joueur.MINERAIS, 0);
        action.act(joueur);
        assertEquals(0, joueur.getRessources().get(Joueur.BOIS));
        assertEquals(0, joueur.getRessources().get(Joueur.MINERAIS));
        assertTrue(outContent.toString().contains("Ressource Insuffisante"));
    }

    @Test
    public void testToString() {
        assertTrue(action.toString().contains("Construire une Ferme"));
    }

    @Test
    public void testGetNbIleConquis() throws Exception {
        // Simuler 2 îles complètement conquises par le joueur
        Foret tuile1 = new Foret(new Position(0, 0));
        Foret tuile2 = new Foret(new Position(0, 1));
        Foret tuile3 = new Foret(new Position(1, 0));
        Foret tuile4 = new Foret(new Position(1, 1));
        jeu.getPlateau().setTuile(tuile1);
        jeu.getPlateau().setTuile(tuile2);
        jeu.getPlateau().setTuile(tuile3);
        jeu.getPlateau().setTuile(tuile4);

        jeu.getRelationTuileBatiment().put(tuile1, new Ferme(joueur));
        jeu.getRelationTuileBatiment().put(tuile2, new Ferme(joueur));
        jeu.getRelationTuileBatiment().put(tuile3, new Ferme(joueur));
        jeu.getRelationTuileBatiment().put(tuile4, new Ferme(joueur));
        // Simuler 2 îles (clé 0 et 1 dans getTuiles())
        jeu.getIle().getTuiles().put(0, java.util.List.of(tuile1, tuile2));
        jeu.getIle().getTuiles().put(1, java.util.List.of(tuile3, tuile4));
        assertEquals(2, action.getNbIleConquis(joueur));
    }

    // @Test
    // @DisplayName("Test de estCompleteIle()")
    // public void testEstCompleteIle() throws Exception {
    //     Foret tuile1 = new Foret(new Position(0, 0));
    //     Foret tuile2 = new Foret(new Position(0, 1));
    //     jeu.getPlateau().setTuile(tuile1);
    //     jeu.getPlateau().setTuile(tuile2);

    //     jeu.getIle().getTuiles().put(0, java.util.List.of(tuile1, tuile2));
    //     jeu.getRelationTuileBatiment().put(tuile1, new Ferme(joueur));
    //     // tuile2 reste vide pour simuler une île incomplète

    //     assertFalse(action.estCompleteIle(0));

    //     jeu.getRelationTuileBatiment().put(tuile2, new Ferme(joueur));
    //     assertTrue(action.estCompleteIle(0));
    // }

    // @Test
    // @DisplayName("Test de occupeIleTotalement()")
    // public void testOccupeIleTotalement() throws Exception {
    //     Foret tuile1 = new Foret(new Position(0, 0));
    //     Foret tuile2 = new Foret(new Position(0, 1));
    //     jeu.getPlateau().setTuile(tuile1);
    //     jeu.getPlateau().setTuile(tuile2);

    //     jeu.getIle().getTuiles().put(0, java.util.List.of(tuile1, tuile2));

    //     jeu.getRelationTuileBatiment().put(tuile1, new Ferme(joueur));
    //     jeu.getRelationTuileBatiment().put(tuile2, new Ferme(joueur));

    //     assertTrue(action.occupeIleTotalement(joueur, 0));
    // }
}
