package util.plateau.outils.combat;

import ares.util.joueur.JoueurAres;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DeTest {
    private De de1, de2;
    private JoueurAres joueur;

    @BeforeEach
    void setUp() {
        joueur = new JoueurAres("Timo");
        de1 = new De(joueur, 1); // 1 seul tirage
        de2 = new De(joueur, 3); // 3 tirages
    }

    @Test
    void testConstructeurEtGetters() {
        assertEquals(joueur, de1.getJoueur1());
        assertEquals(1, de1.getNbTirages());

        assertEquals(joueur, de2.getJoueur1());
        assertEquals(3, de2.getNbTirages());
    }

    @Test
    void testLancerDes_UnSeulTirage() {
        int resultat = de1.lancerDes();
        assertTrue(resultat >= 1 && resultat <= 6, "Résultat hors des limites pour un seul tirage.");
    }

    @Test
    void testLancerDes_MultipleTirages() {
        int resultat = de2.lancerDes();
        assertTrue(resultat >= 3 && resultat <= 18, "Résultat hors des limites pour 3 tirages.");
    }

    @Test
    void testLancerDes_LimiteInferieure() {
        De deMin = new De(joueur, 1);
        int resultat = deMin.lancerDes();
        assertTrue(resultat >= 1 && resultat <= 6);
    }

    @Test
    void testLancerDes_LimiteSuperieure() {
        De deMax = new De(joueur, 5);
        int resultat = deMax.lancerDes();
        assertTrue(resultat >= 5 && resultat <= 30);
    }
}
