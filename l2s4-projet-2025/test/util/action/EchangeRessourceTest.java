package util.action;

import ares.Ares;
import ares.util.joueur.JoueurAres;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import util.joueur.Joueur;
import util.plateau.outils.ressource.Ressource;

import java.util.Scanner;

import static org.junit.jupiter.api.Assertions.*;
// teste de echange ressource 
public class EchangeRessourceTest {
    private EchangeRessource action;
    private JoueurAres joueur;
    private Ares jeu;
    
    @BeforeEach
    public void setUp() {
        jeu = new Ares(10, 10);
        joueur = new JoueurAres("Alice");
        action = new EchangeRessource(jeu);
        jeu.addActions(action);
    }

    @Test
    public void testEquals() {
        EchangeRessource sameAction = new EchangeRessource(jeu);
        assertEquals(action, sameAction);

        Object differentObject = new Object();
        assertNotEquals(action, differentObject);
    }
 @Test
    public void testActWithSufficientResources() {
        joueur.addRessource(Joueur.MINERAIS,30);
        joueur.addRessource(Joueur.BLE,30);
        joueur.addRessource(Joueur.MOUTON,30);
        joueur.addRessource(Joueur.BOIS,30);
        joueur.addRessource(JoueurAres.ARME_SECRETE, 30);
        // Simulation choix minerais pour échanger contre bois
        action.sc = new Scanner("1\n1\n");
        action.act(joueur);
        // echange reussie donc il a moins de minerais
        int aAugmenter = 0;
        int aDiminuer = 0;
        for (Ressource ressource : joueur.getRessources().keySet()) {
            if (joueur.getRessources().get(ressource) < 30){
                aDiminuer = aDiminuer+1;
            }
            if (joueur.getRessources().get(ressource) > 30){
                aAugmenter=aAugmenter+1;
            }
        }
        // 1 ressources a diminuer , 1  a augmenter
        assertEquals(1, aAugmenter);
        assertEquals(1, aDiminuer);
        assertTrue(action.getPrerequis().isEmpty());
        }

    /**teste sans ressource on verifie la sortie et que ces ressources n'ont pas changé*/
    @Test
    public void testActWithInsufficientResources() {
        // Simuler les choix de l'utilisateur
        // aucune echange na etait effectue
        joueur.addRessource(JoueurAres.GUERRIER, -30);
        action.sc = new Scanner("1\n2\n");
        action.act(joueur);
        // echange reussie donc il a moins de minerais
        int aAugmenter = 0;
        int aDiminuer = 0;
        for (Ressource ressource : joueur.getRessources().keySet()) {
            if (joueur.getRessources().get(ressource) < 0){
                aDiminuer = aDiminuer+1;
            }
            if (joueur.getRessources().get(ressource) > 0){
                aAugmenter=aAugmenter+1;
            }
        }
        // aucune ressource echanger a diminuer reste 0  a augmente aussi 
        assertEquals(0, aAugmenter);
        assertEquals(0, aDiminuer);
        assertTrue(action.getPrerequis().isEmpty());
    }
    @Test
    public void testToString() {
        assertEquals("Echange de ressources 3 Ressources contre 1", action.toString());
    }
}