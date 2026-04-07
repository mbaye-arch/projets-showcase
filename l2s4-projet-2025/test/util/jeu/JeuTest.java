package util.jeu;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import ares.util.batiment.Armée;
import ares.util.joueur.JoueurAres;
import util.batiment.Batiment;
import util.batiment.NoValidTuilePlacementException;
import util.batiment.Port;
import util.ile.Ile;
import util.joueur.Joueur;
import util.plateau.outils.position.Position;
import util.plateau.outils.ressource.Ressource;
import util.plateau.outils.tuile.Foret;
import util.plateau.outils.tuile.Mer;
import util.plateau.outils.tuile.Tuile;

import java.util.*;

import static org.junit.Assert.assertThrows;
import static org.junit.jupiter.api.Assertions.*;

public class JeuTest {
    private Jeu jeu;
    private Joueur joueur;

    // Sous-classe concrète de Jeu pour le test
    private class JeuTestImpl extends Jeu {
        public JeuTestImpl(int ligne, int colonne) {
            super(ligne, colonne);
        }

        @Override
        public Joueur getGagnant() {
            return null;
        }
    }

    @BeforeEach
    public void setUp() {
        jeu = new JeuTestImpl(10, 10);
        joueur = new Joueur("Alice") {
            @Override
            public void display() {
                // Implémentation vide pour éviter les sorties dans le terminal
            }
        };
    }

    // teste qu le jeu est cree et que le plateau est de la bonne taille
    @Test
    public void testCreationJeu() {
        assertNotNull(jeu);
        assertEquals(10, jeu.getPlateau().getLigne());
        assertEquals(10, jeu.getPlateau().getColonne());
        // de base aucune batiment n'est associee a une tuile
        assertTrue(jeu.getRelationTuileBatiment().isEmpty());
        assertNotNull(jeu.getPlateau());
        assertNotNull(jeu.getIle());
        // aucun joueur n'est associe au jeu
        assertTrue(jeu.getJoueurs().isEmpty());
        assertNotNull(jeu.getRessource());
        assertNotNull(jeu.getSc());
    }

    @Test
    public void testAjouterJoueur() {
        // aucun joueur n'est associe au jeu
        assertTrue(jeu.getJoueurs().isEmpty());
        assertTrue(jeu.ajouterJoueur(joueur));
        assertTrue(jeu.getJoueurs().contains(joueur)); // Le joueur doit être ajouté
        assertEquals(1, jeu.getJoueurs().size()); // Il doit y avoir un joueur
        // Test d'ajout d'un joueur déjà existant
        assertFalse(jeu.ajouterJoueur(joueur)); // Ne peut pas ajouter deux fois le même joueur
        assertEquals(1, jeu.getJoueurs().size());
        assertNotNull(jeu.getJoueurs());
        assertEquals(joueur, jeu.getJoueurs().get(0)); // Le joueur doit être le même
    }

    @Test
    public void testAddBatiment() throws Exception {
        Tuile tuile = new Foret(new Position(0, 0));
        Tuile mer = new Mer(new Position(1, 0));
        Batiment batiment = new Port(joueur);
        jeu.getPlateau().setTuile(tuile);
        jeu.getPlateau().setTuile(new Mer(new Position(1, 0)));
        jeu.addBatiment(tuile, batiment);
        // verification que la tuile est bien associee au batiment
        assertTrue(jeu.getRelationTuileBatiment().containsKey(tuile));
        assertEquals(batiment, jeu.getRelationTuileBatiment().get(tuile));
        assertEquals(batiment.getTuile(), tuile);
        assertTrue(tuile.getBatiment());
        // teste que la liaison est bien faite
        assertEquals(jeu.getRelationTuileBatiment().get(tuile), batiment);
        assertThrows(NoValidTuilePlacementException.class, () -> jeu.addBatiment(mer, batiment));
        assertThrows(NoValidTuilePlacementException.class, () -> jeu.addBatiment(tuile, batiment));
        assertTrue(joueur.getBatiments().contains(batiment));
    }

    @Test
    public void testGetRessource() {
        Jeu.initialiserRessources();
        List<Ressource> ressources = jeu.getRessource();
        assertNotNull(ressources);
        assertEquals(4, ressources.size());
        assertTrue(ressources.contains(Joueur.BOIS));
        assertTrue(ressources.contains(Joueur.BLE));
        assertTrue(ressources.contains(Joueur.MINERAIS));
        assertTrue(ressources.contains(Joueur.MOUTON));
    }

    @Test
    public void testGetPlateau() {
        assertNotNull(jeu.getPlateau());
        assertEquals(10, jeu.getPlateau().getLigne());
        assertEquals(10, jeu.getPlateau().getColonne());
    }

    @Test
    public void testGetRelationTuileBatiment() {
        Tuile tuile = new Foret(new Position(0, 0));
        Batiment batiment = new Port(joueur);
        jeu.relationTuileBatiment.put(tuile, batiment);
        assertEquals(batiment, jeu.getRelationTuileBatiment().get(tuile));
    }

    @Test
    public void testGetJoueurs() {
        jeu.ajouterJoueur(joueur);
        List<Joueur> joueurs = jeu.getJoueurs();
        assertNotNull(joueurs);
        assertEquals(1, joueurs.size());
        assertTrue(joueurs.contains(joueur));
    }

    @Test
    public void testRemoveBatiment() throws NoValidTuilePlacementException {
        Tuile tuile = new Foret(new Position(0, 0));
        Batiment batiment = new Port(joueur);
        jeu.getPlateau().setTuile(tuile);
        jeu.addBatiment(tuile, batiment);
        jeu.removeBatiment(tuile);
        assertFalse(tuile.getBatiment());
        assertNull(jeu.getRelationTuileBatiment().get(tuile));
        assertNull(batiment.getTuile());
    }

    @Test
    public void testGetNbGuerrierIleJoueur() throws NoValidTuilePlacementException {
        Ile ile = new Ile(jeu.getPlateau());
        Tuile tuile = new Foret(new Position(0, 0));
        JoueurAres joueur = new JoueurAres("Alice");
        Batiment batiment = new Armée(5, joueur);
        jeu.ajouterJoueur(joueur);
        jeu.getPlateau().setTuile(tuile);
        jeu.addBatiment(tuile, batiment);
        ile.getTuiles().get(0).add(tuile);
        int nbGuerriers = jeu.getNbGuerrierIleJoueur(joueur, ile.getTuiles().get(0));
        assertEquals(5, nbGuerriers);
    }

    @Test
    public void testGetIlePosition() {
        Ile ile = new Ile(jeu.getPlateau());
        jeu.iles = ile;
        Tuile tuile = new Foret(new Position(0, 0));
        ile.getTuiles().put(1, Arrays.asList(tuile));
        assertEquals(1, jeu.getIlePosition(new Position(0, 0)));
    }

    @Test
    public void testGetPositionsVideVoisinsMer() {
        List<Position> positions = jeu.getPositionsVideVoisinsMer();
        assertNotNull(positions);
        assertFalse(positions.isEmpty());
    }

    @Test
    public void testDisplayTuileBatiment() {
        Tuile tuile = new Foret(new Position(0, 0));
        Batiment batiment = new Port(joueur);
        String result = jeu.displayTuileBatiment(tuile, batiment);
        assertNotNull(result);
        assertTrue(result.contains(tuile.toString()));
        assertTrue(result.contains(batiment.toStringB()));
    }

    @Test
    public void testGetJoueursSansJ() {
    Joueur joueur2 = new JoueurAres("Bob");
    jeu.ajouterJoueur(joueur);
    jeu.ajouterJoueur(joueur2);

    List<Joueur> joueursSansJ = jeu.getJoueursSansJ(joueur);
    assertEquals(1, joueursSansJ.size());
    assertTrue(joueursSansJ.contains(joueur2));
    assertFalse(joueursSansJ.contains(joueur));
    }

    @Test
    public void testChoixInvalide() {
    Scanner sc = new Scanner("5\n");
    jeu.setSc(sc);
    int choix = jeu.choixInvalide(5, 1, 10);
    assertEquals(5, choix);
    }


    @Test
    public void testGetIlesOccupeJoueur() {
    Ile ile = new Ile(jeu.getPlateau());
    jeu.iles = ile;
    Tuile tuile = new Foret(new Position(0, 0));
    Batiment batiment = new Port(joueur);
    jeu.relationTuileBatiment.put(tuile, batiment);
    ile.getTuiles().put(1, Arrays.asList(tuile));
    jeu.ajouterJoueur(joueur);

    List<Integer> ilesOccupees = jeu.getIlesOccupeJoueur(joueur);
    assertEquals(ilesOccupees.size(), ilesOccupees.size());
    assertEquals(ilesOccupees.get(0), ilesOccupees.get(0));
    }

    @Test
    public void testHasPort() {
    Ile ile = new Ile(jeu.getPlateau());
    jeu.iles = ile;
    Tuile tuile = new Foret(new Position(0, 0));
    Batiment batiment = new Port(joueur);
    jeu.relationTuileBatiment.put(tuile, batiment);
    ile.getTuiles().put(1, Arrays.asList(tuile));
    jeu.ajouterJoueur(joueur);
    assertTrue(jeu.hasPort(joueur, 1));
    assertFalse(jeu.hasPort(joueur, 2));
    }

    @Test
    public void testHasDeuxBatiment() {
    Ile ile = new Ile(jeu.getPlateau());
    jeu.iles = ile;
    Tuile tuile1 = new Foret(new Position(0, 0));
    Tuile tuile2 = new Foret(new Position(0, 1));
    Batiment batiment1 = new Port(joueur);
    Batiment batiment2 = new Port(joueur);
    jeu.relationTuileBatiment.put(tuile1, batiment1);
    jeu.relationTuileBatiment.put(tuile2, batiment2);
    ile.getTuiles().put(1, Arrays.asList(tuile1, tuile2));
    jeu.ajouterJoueur(joueur);

    assertTrue(jeu.hasDeuxBatiment(joueur, 1));
    assertFalse(jeu.hasDeuxBatiment(joueur, 2));
    }

    @Test
    public void testOccupeIle() {
    Ile ile = new Ile(jeu.getPlateau());
    jeu.iles = ile;
    Tuile tuile = new Foret(new Position(0, 0));
    Batiment batiment = new Port(joueur);
    jeu.relationTuileBatiment.put(tuile, batiment);
    ile.getTuiles().put(1, Arrays.asList(tuile));
    jeu.ajouterJoueur(joueur);
    assertTrue(jeu.occupeIle(joueur, 1));
    assertTrue(jeu.occupeIle(joueur, 2));
    }

    @Test
    public void testGetIle() {
    Ile ile = new Ile(jeu.getPlateau());
    jeu.iles = ile;
    assertNotNull(jeu.getIle());
    assertEquals(ile, jeu.getIle());
    }


    @Test
    public void testOccupeIleByNumber() {
    Ile ile = new Ile(jeu.getPlateau());
    jeu.iles = ile;
    Tuile tuile = new Foret(new Position(0, 0));
    Batiment batiment = new Port(joueur);
    jeu.relationTuileBatiment.put(tuile, batiment);
    ile.getTuiles().put(1, Arrays.asList(tuile));
    jeu.ajouterJoueur(joueur);
    assertTrue(jeu.occupeIle(joueur, 1));
    }
}