package util.action;
import static org.junit.Assert.*;
import org.junit.Before;
import org.junit.Test;

import ares.Ares;
import ares.util.joueur.JoueurAres;

import java.util.HashMap;
import java.util.Scanner;

import util.jeu.Jeu;
import util.joueur.Joueur;
import util.plateau.outils.ressource.Ressource;

public class EchangerTest {

    private Echanger echanger;
    private Joueur joueur;
    private Jeu jeu;

    @Before
    public void setUp() {
        jeu = new Ares(10,10);
        joueur = new JoueurAres("TestPlayer");
        HashMap<Ressource, Integer> prerequis = new HashMap<>();
        prerequis.put(Joueur.BOIS, 5);
        echanger = new Echanger(jeu, prerequis);
    }

    @Test
    public void testActWithSufficientResources() {
        //ajout des ressources au joueur
        joueur.addRessource(Joueur.BOIS, 10); 
        System.out.println(echanger.getPrerequis());
        echanger.act(joueur, Joueur.BOIS, Joueur.BLE, 5, 10);
        // verification
        assertEquals(Integer.valueOf(5), joueur.getRessources().get(Joueur.BOIS)); 
        assertEquals(Integer.valueOf(10), joueur.getRessources().get(Joueur.BLE)); 
    }

    @Test
    public void testActWithInsufficientResources() {
        joueur.addRessource(Joueur.BOIS, 3); 
        echanger.act(joueur, Joueur.BOIS, Joueur.BLE, 3, 5);
        assertEquals(Integer.valueOf(0), joueur.getRessources().get(Joueur.BOIS)); 
        assertEquals(Integer.valueOf(5), joueur.getRessources().get(Joueur.BLE)); 
    }

    @Test
    public void testChoixRessourceEchange() {
        echanger.setSc(new Scanner("1\n"));
        Ressource chosen = echanger.choixRessourceEchange();
        assertTrue(chosen instanceof Ressource); 
    }

    @Test
    public void testChoixRessourceAEchanger() {        
        echanger.setSc(new Scanner("1\n"));
        Ressource chosen = echanger.choixRessourceAEchanger(Joueur.BOIS);
        assertEquals(Joueur.BLE, chosen); 
    }
}