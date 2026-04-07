package demeter.util.batiment;

import demeter.util.joueur.JoueurDemeter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class FermeTest {

    private Ferme ferme1;
    private Ferme ferme2;
    private JoueurDemeter joueur1;
    private JoueurDemeter joueur2;

    @BeforeEach
    void setUp() {
        joueur1 = new JoueurDemeter("Joueur1");
        joueur2 = new JoueurDemeter("Joueur2");

        ferme1 = new Ferme(joueur1);
        ferme2 = new Ferme(joueur1);
    }

    @Test
    void testEquals() {
        assertEquals(ferme1, ferme2, "Deux fermes du même joueur doivent être égales");

        Ferme fermeDiffJoueur = new Ferme(joueur2);
        assertNotEquals(ferme1, fermeDiffJoueur, "Deux fermes de joueurs différents ne doivent pas être égales");
    }

    @Test
    void testToString() {
        String expected = "Joueur1 --> Ferme";
        assertEquals(expected, ferme1.toString(), "La méthode toString() ne retourne pas la bonne valeur");
    }

    @Test
    void testGetProprietaire() {
        assertEquals(joueur1, ferme1.getProprietaire(), "Le propriétaire de la ferme est incorrect");
    }

    @Test
    void testGetDimension() {
        assertEquals(1, ferme1.getDimension(), "La dimension de la ferme devrait être de 1");
    }
}
