package ares.util.joueur.objectif;

import ares.util.joueur.JoueurAres;
import ares.util.batiment.Camp;
import ares.Ares;
import util.jeu.Jeu;
import util.plateau.outils.position.Position;
import util.plateau.outils.tuile.Foret;
import util.plateau.outils.tuile.Tuile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class EnvIleTest {

    private EnvIle envIle;
    private JoueurAres joueur;
    private Jeu jeu;
    private Tuile tuile1;
    private Tuile tuile2;

    @BeforeEach
    public void setUp() {
        jeu = new Ares(10, 10); // exemple jeu 10x10
        joueur = new JoueurAres("TestPlayer");
        envIle = new EnvIle(jeu, joueur);

        tuile1 = new Foret(new Position(0, 0)); // Foret factice
        tuile2 = new Foret(new Position(1, 0)); // autre tuile factice
    }

    @Test
    public void testToString() {
        assertEquals("Vous devez envahir une Ile totalement", envIle.toString());
    }

    @Test
    public void testAAtteintObjectifFalseQuandAucuneIle() {
        assertFalse(envIle.aAtteintObjectif());
    }

    @Test
    public void testAAtteintObjectifTrueQuandIleCompleteEtConquise() {
        // Préparer une île avec deux tuiles conquises
        List<Tuile> ile = new ArrayList<>();
        ile.add(tuile1);
        ile.add(tuile2);

        // Préparer la relation Tuile -> Batiment
        jeu.getRelationTuileBatiment().put(tuile1, new Camp(1, joueur));
        jeu.getRelationTuileBatiment().put(tuile2, new Camp(1, joueur));

        // Ajouter l'île au jeu
        jeu.getIle().getTuiles().put(1, ile);

        assertTrue(envIle.aAtteintObjectif());
    }

    @Test
    public void testEstCompletIleFalseQuandTuileVide() {
        List<Tuile> ile = new ArrayList<>();
        ile.add(tuile1); // Pas de bâtiment associé
        assertFalse(envIle.estCompletIle(ile));
    }

    @Test
    public void testAConquisIleFalseQuandTuilePasProprietaire() {
        List<Tuile> ile = new ArrayList<>();
        ile.add(tuile1);

        JoueurAres autreJoueur = new JoueurAres("AnotherPlayer");
        jeu.getRelationTuileBatiment().put(tuile1, new Camp(1, autreJoueur));

        assertFalse(envIle.aConquisIle(ile));
    }
}
