package util.action;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import util.batiment.Batiment;
import util.joueur.Joueur;
import util.plateau.outils.ressource.Ressource;

import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class NeRienFaireTest {
    private NeRienFaire action;
    private Joueur joueur;

    @BeforeEach
    public void setUp() {
        action = new NeRienFaire();
        joueur = new Joueur("Alice") {
            @Override
            public void display() {
                // Implémentation vide pour éviter les sorties dans le terminal
            }
        };
    }

    @Test
    public void testAct() throws Exception {
        // ne rein faire doit impcater en rien sur la liste des joueurs et de ces batiments 
        List<Batiment> batimentAncien = new ArrayList<>(joueur.getBatiments());
        Map<Ressource,Integer> RessourceAncien = new HashMap<>(joueur.getRessources());
        action.act(joueur);
        assertEquals(batimentAncien, joueur.getBatiments());
        assertEquals(joueur.getRessources(), RessourceAncien);
        assertTrue(action.displayActionEffectue());
    }

    @Test
    public void testToString() {
        assertEquals("Ne Rien Faire (tes ressources vont augmenter)", action.toString());
    }
}