package util.ile;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import util.plateau.Plateau;
import util.plateau.outils.position.Position;
import util.plateau.outils.tuile.Tuile;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class IleTest {

    private Ile ile;
    private Plateau plateau;

    @BeforeEach
    void setUp() {
        // Création d'un plateau de 10x10 pour tester
        plateau = new Plateau(10, 10);
        ile = new Ile(plateau);
    }

    @Test
    void testPlateauNotNull() {
        assertNotNull(ile.getPlateau(), "Le plateau ne devrait pas être nul.");
    }

    @Test
    void testIlesNotEmpty() {
        Map<Integer, List<Tuile>> iles = ile.getTuiles();
        assertFalse(iles.isEmpty(), "Les îles ne devraient pas être vides.");
    }

    @Test
    void testDonneIle() {
        // Vérification qu'une tuile donnée appartient bien à une île
        Tuile tuile = plateau.getTuile(new Position(2, 2));
        List<Tuile> tuilesIle = ile.donneIle(tuile, plateau.getTuileNonMer());

        assertNotNull(tuilesIle, "La liste de l'île ne devrait pas être nulle.");
        assertFalse(tuilesIle.isEmpty(), "L'île ne devrait pas être vide.");
        assertTrue(tuilesIle.contains(tuile), "L'île devrait contenir la tuile de départ.");
    }

    @Test
    void testAUnVoisinProche() {
        List<Tuile> toutesLesTuiles = plateau.getTuileNonMer();

        if (toutesLesTuiles.size() < 2) {
            fail("Pas assez de tuiles pour tester les voisins.");
        }

        //Tuile tuile1 = toutesLesTuiles.get(0);
        //Tuile tuile2 = toutesLesTuiles.get(1);
    }

    @Test
    void testAfficherIles() {
        assertDoesNotThrow(() -> ile.afficherIles(), "L'affichage des îles ne devrait pas provoquer d'exception.");
    }
}
