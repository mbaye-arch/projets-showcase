package util.action;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import ares.Ares;
import ares.util.batiment.Armée;
import ares.util.joueur.JoueurAres;
import util.batiment.Batiment;
import util.batiment.NoValidTuilePlacementException;
import util.jeu.Jeu;
import util.joueur.Joueur;
import util.plateau.outils.position.Position;
import util.plateau.outils.ressource.Ressource;
import util.plateau.outils.tuile.Foret;
import util.plateau.outils.tuile.*;

import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.*;

class ConstruireTest {

    private Construire construire;
    private Jeu jeu;
    private Joueur joueur;
    private Position position;
    private Batiment batiment;
    private HashMap<Ressource, Integer> prerequis;

    @BeforeEach
    void setUp() throws NoValidTuilePlacementException {
        // Initialisation des objets nécessaires
        jeu = new Ares(10, 10); // Exemple de jeu avec une grille 10x10
        joueur = new JoueurAres("TestPlayer");
        position = new Position(5, 5); // Position arbitraire
        batiment = new Armée(1, (JoueurAres) joueur); // Exemple de bâtiment
        prerequis = new HashMap<>();
        prerequis.put(Joueur.BOIS, 5); // Exemple de ressource requise
        construire = new Construire(prerequis, jeu);
    }

    @Test
    void testAct_SuccessfulConstruction() throws Exception {
        assertNotNull(construire);
        // Ajout des ressources nécessaires au joueur
        Tuile tuile = new Foret(position);
        jeu.getPlateau().setTuile(tuile);
        joueur.addRessource(Joueur.BOIS, 10);
        // Exécution de l'aéction
        boolean result = construire.act(joueur, position, batiment);
        // Vérifications
        assertTrue(result);
        assertTrue(jeu.getRelationTuileBatiment().containsKey(tuile));
        assertEquals(jeu.getRelationTuileBatiment().get(tuile),batiment);
        assertTrue(joueur.getBatiments().contains(batiment));
    }

    @Test
    void testAct_UnsuccessfulDueToMissingResources() throws Exception {
        // Ajout de ressources insuffisantes au joueur
        joueur.addRessource(Joueur.BOIS, 3);
        // Exécution de l'action
        boolean result = construire.act(joueur, position, batiment);
        // Vérifications
        assertFalse(result);
        assertFalse(jeu.getRelationTuileBatiment().containsValue(batiment), "Le bâtiment n'aurait pas dû être ajouté au plateau.");
        assertEquals(3, joueur.getRessources().get(Joueur.BOIS), "Les ressources n'auraient pas dû être modifiées.");
    }

    @Test
    void testToString() {
        assertEquals("Construire", construire.toString(), "La méthode toString devrait retourner 'Construire'.");
    }

    @Test
    void testRegleArmeePort() {
        // Vérification des messages affichés dans la console
        construire.regleArméePort();
        // Pas de vérification directe ici, mais on peut s'assurer que la méthode ne lève pas d'exception

    }
}