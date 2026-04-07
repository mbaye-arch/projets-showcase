package demeter;

import demeter.util.joueur.JoueurDemeter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import util.action.Action;
import util.action.EchangeRessource;
import util.batiment.NoValidTuilePlacementException;
import util.jeu.Jeu;
import util.plateau.outils.position.Position;
import util.plateau.outils.tuile.Foret;

import java.util.Scanner;

import static org.junit.jupiter.api.Assertions.*;

public class DemeterTest {
    private Jeu jeu;
    private JoueurDemeter joueur;

    @BeforeEach
    public void setUp() {
        jeu = new Demeter(10, 10);
        joueur = new JoueurDemeter("Alice");
        jeu.ajouterJoueur(joueur);
    }

    @Test
    public void testCreationDemeter() {
        assertNotNull(jeu);
        assertEquals(10, jeu.getPlateau().getLigne());
        assertEquals(10, jeu.getPlateau().getColonne());
    }

    @Test
    public void testInitialiseJeu() throws NoValidTuilePlacementException {
        jeu.getPlateau().setTuile(new Foret(new Position(0, 0)));
        jeu.getPlateau().setTuile(new Foret(new Position(0, 1)));
        jeu.sc = new Scanner("0\n0\n\n0\n1\n");
        ((Demeter) jeu).initialiseJeu();
        // le batiment a ete cree
        assertEquals(1, jeu.getRelationTuileBatiment().size());
    }

    @Test
    public void testGame() throws Exception {
        jeu.getPlateau().setTuile(new Foret(new Position(0, 0)));
        jeu.getPlateau().setTuile(new Foret(new Position(0, 1)));
        // Utiliser une action concrète
        Action action = new EchangeRessource(jeu);
        jeu.getActions().add(action);
        // Simuler les choix de l'utilisateur
        jeu.sc = new Scanner("0\n0\n\n0\n1\n0\n");

        // Lancer le jeu dans un thread séparé pour éviter la boucle infinie
        Thread gameThread = new Thread(() -> {
            try {
                ((Demeter) jeu).Game();
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        gameThread.start();

        // Attendre un peu pour que le jeu se lance
        Thread.sleep(1000);

        // Arrêter le jeu
        gameThread.interrupt();

        // Vérifier que le jeu a bien démarré
        assertTrue(((Demeter) jeu).getNbTours() > 0);
    }

    @Test
    public void testGetGagnant() {
        assertThrows(UnsupportedOperationException.class, () -> {
            jeu.getGagnant();
        });
    }

    @Test
    public void testChosirAction() {
        Action action1 = new EchangeRessource(jeu);
        Action action2 = new EchangeRessource(jeu);
        jeu.getActions().add(action1);
        jeu.getActions().add(action2);

        // Simuler les choix de l'utilisateur
        ((Demeter)jeu).sc = new Scanner("1\n");

        Action chosenAction = ((Demeter) jeu).choisirAction(joueur);
        assertEquals(action2, chosenAction);
    }

    @Test
    public void testGetNbTours() {
        // pour dire un tour est passe
        assertEquals(1, ((Demeter) jeu).getNbTours());
    }
}