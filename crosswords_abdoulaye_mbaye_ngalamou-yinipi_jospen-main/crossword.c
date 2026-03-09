#include <stdio.h>
#include <string.h>
#include <stdbool.h>
#include <stdlib.h>
#include <time.h>
#include "crossword.h"
#include "lexicon.h"
#include "alea.h"

// Global pointer used by the qsort comparator to access the current lexicon
static char (*current_lexicon)[MAX_WORD_LEN] = NULL;

//  fonction pour initialiser la grille avec des caractères vides
void initialize_grille(char grille[taille_grille_ligne][taille_grille_colonne])
{

    for (int i = 0; i < taille_grille_ligne; i++)
    {
        for (int j = 0; j < taille_grille_colonne; j++)
        {
            grille[i][j] = vide;
        }
    }
}

// fonction pour l'affichage de la grille
void print_grille(char grille[taille_grille_ligne][taille_grille_colonne])
{
    // creer de l'espace au debut
    printf("\n    ");
    for (int j = 0; j < taille_grille_colonne; j++)
    {
        printf("%2d ", j); // Numéros colonnes
    }
    printf("\n   +");

    for (int j = 0; j < taille_grille_colonne; j++)
    {
        printf("---");
    }
    printf("+\n");

    for (int i = 0; i < taille_grille_ligne; i++)
    {
        printf("%2d | ", i); // Numéros lignes
        for (int j = 0; j < taille_grille_colonne; j++)
        {
            printf("%c  ", grille[i][j]);
        }
        printf("|\n");
    }

    printf("   +");
    for (int j = 0; j < taille_grille_colonne; j++)
        printf("---");
    printf("+\n");

    // creer de l'espace a la fin
    printf("\n    ");
}

// fonction pour placier un mot dans la grille
// direction  c'est la direction ection pour placer le mot : 0 pour horizontal, 1 pour vertical
void place_word(char grille[taille_grille_ligne][taille_grille_colonne], char *word, int row, int col, int direction)
{
    int len = strlen(word);

    // Vérifier si le mot tient dans la grille
    if (direction == HORIZONTAL)
    { // horizontal
        if (col < 0 || col + len > taille_grille_colonne || row < 0 || row >= taille_grille_ligne)
        {
            printf("erreur : Mot hors limites (horizontal)\n");
            return;
        }
    }
    else
    { // vertical
        if (row < 0 || row + len > taille_grille_ligne || col < 0 || col >= taille_grille_colonne)
        {
            printf("erreur : Mot hors limites (vertical)\n");
            return;
        }
    }

    for (int i = 0; i < len; i++)
    {
        if (direction == 0)
        { // horizontal
            grille[row][col + i] = word[i];
        }
        else
        { // dans le cas contraire le placer en vertical
            grille[row + i][col] = word[i];
        }
    }
}

/**
 * genere une indice valable de placement dun mot dans lhorizontal ou dans le vertical
 */
int get_indice_alea_valide(int taille_colonne, char mot[])
{
    int taille_mot = strlen(mot);
    if (taille_mot > taille_colonne)
    {
        return -1; // erreur pas dindice valid emot ne paeut pas etre place
    }
    else if (taille_mot == taille_colonne)
    {
        return 0;
    }
    else
    {
        initialise_rand();
        return hasard(0, taille_colonne - taille_mot);
    }
}
// fonction pour generer une grille factice avec les most du lexique
// en focntion d'un nombre de mots fixés par nous mêmes

void generation_horizontal(char grille[taille_grille_ligne][taille_grille_colonne], char lexicon[MAX_WORDS][MAX_WORD_LEN], int nbre_mots)
{
    int limit;

    // eviter depasser la taille de la grille
    if (nbre_mots < taille_grille_ligne)
    {
        limit = nbre_mots;
    }
    else
    {
        limit = taille_grille_ligne;
    }

    for (int i = 0; i < limit; i++)
    {
        char *word = lexicon[i];
        int len = strlen(word); // calculer la longueur du mot

        // indice aleatoire pour le placement du mot
        int indice = get_indice_alea_valide(taille_grille_colonne, word);

        for (int k = 0; k < len; k++)
        {
            grille[i][indice + k] = word[k]; // position tousles elemenst de la grille a la ligne i
        }
    }
}

// fonction pour generer une grille factice avec les most du lexique en vertical
// en focntion d'un nombre de mots fixés par nous mêmes
void generation_vertical(char grille[taille_grille_ligne][taille_grille_colonne], char lexicon[MAX_WORDS][MAX_WORD_LEN], int nbre_mots)
{

    int limit;

    if (nbre_mots < taille_grille_colonne)
    {
        limit = nbre_mots;
    }
    else
    {
        limit = taille_grille_colonne;
    }

    for (int i = 0; i < limit; i++)
    {
        char *word = lexicon[i];
        int len = strlen(word);
        // indeice aleatoire pour le placement du mot
        int indice = get_indice_alea_valide(taille_grille_ligne, word);

        for (int k = 0; k < len; k++)
        {
            grille[indice + k][i] = word[k];
        }
    }
}

// fonction pour verifier les emplacements et les intersections
// Vérifie si le mot peut être placé à (row, col) dans la direction ection direction .
bool placement_valide(char grille[taille_grille_ligne][taille_grille_colonne], char *word, int row, int col, int direction)
{
    int len = strlen(word);
    int intersections = 0;

    //  0. Vérification des limites de la grille
    if (direction == HORIZONTAL)
    { // Horizontal
        if (col < 0 || col + len > taille_grille_colonne || row < 0 || row >= taille_grille_ligne)
            return false;
    }
    else
    { // Vertical
        if (row < 0 || row + len > taille_grille_ligne || col < 0 || col >= taille_grille_colonne)
            return false;
    }

    //  1. Vérification des extrémités
    // Les cases immédiatement avant et après doivent être vides
    if (direction == HORIZONTAL)
    { // Horizontal
        // verifier la case avant et apres le mot
        if (col > 0 && grille[row][col - 1] != vide)
            return false; // Avant
        if (col + len < taille_grille_colonne && grille[row][col + len] != vide)
            return false; // Après
    }
    else
    { // Vertical
        if (row > 0 && grille[row - 1][col] != vide)
            return false; // Avant
        if (row + len < taille_grille_ligne && grille[row + len][col] != vide)
            return false; // Après
    }

    //  2. Vérification sur la longueur du mot
    for (int i = 0; i < len; i++)
    {

        // evolution des coordonnees du mot a placees
        int r = (direction == HORIZONTAL) ? row : row + i; // en fonction de la direction (vertical ou horizontal)
        int c = (direction == HORIZONTAL) ? col + i : col;

        char grille_char = grille[r][c];
        char word_char = word[i];

        // gestion des regles de confilits  dans le crosssword

        // regle 1 Vérification de la cellule actuelle
        if (grille_char != vide)
        {
            // case occupée -> Doit être une intersection valide
            if (grille_char != word_char)
                return false; // conflit de lettres
            intersections++;
        }

        //  Vérification des voisins perpendiculaires (regle 2: conflit avec les voisins)
        // seulement si ce n'est PAs un point d'intersection (l'intersection est traitée à l'étape 3)
        if (grille_char == vide || grille_char != word_char)
        {

            // Voisins perpendiculaires (haut/bas si Horizontal, gauche/droite si Vertical)
            if (direction == HORIZONTAL)
            { // horizontal: Voisins Verticaux (haut/bas)
                // haut
                if (r > 0 && grille[r - 1][c] != vide)
                    return false;
                // bas
                if (r < taille_grille_ligne - 1 && grille[r + 1][c] != vide)
                    return false;
            }
            else
            { // Vertical: Voisins Horizontaux (gauche/droite)
                // gauche
                if (c > 0 && grille[r][c - 1] != vide)
                    return false;
                // droite
                if (c < taille_grille_colonne - 1 && grille[r][c + 1] != vide)
                    return false;
            }
        }
    }

    //  3. critère d'intersection (regle 1: Pas d'intersection si la grille n'est pas vide)
    // cette vérification est cruciale *après* avoir tenté de placer le premier mot.
    // Pour simplifier, on suppose que si le centre de la grille n'est pas vide, le mot doit croiser.

    // Vérification simplifiée pour savoir si la grille contient déjà des mots :
    bool grille_is_vide = true;
    for (int i = 0; i < taille_grille_ligne; i++)
    {
        for (int j = 0; j < taille_grille_colonne; j++)
        {
            if (grille[i][j] != vide)
            {
                grille_is_vide = false;
                break;
            }
        }
        if (!grille_is_vide)
            break;
    }

    if (!grille_is_vide && intersections == 0)
    {
        return false; // si la grille n'est pas vide, il faut au moins une intersection.
    }

    // si nous sommes arrivés ici, c'est que le placement est valide.
    return true;
}

// fonction pour generer la grille finale de mots croisés
void generation_final(char grille[taille_grille_ligne][taille_grille_colonne], char lexicon[MAX_WORDS][MAX_WORD_LEN], int nbre_mots)
{
    if (nbre_mots == 0)
        return;

    // 1. placer le premier mot au centre de la grille
    // on le place verticalement. On peut le centrer pour un meilleur départ.
    char *first_word = lexicon[0];
    int start_row = taille_grille_ligne / 2;
    int start_col = taille_grille_colonne / 2 - strlen(first_word) / 2;
    place_word(grille, first_word, start_row, start_col, VERTICAL); // 0 pour horizontal

    // variable pour le nombre de mots places
    int mot_places = 0;

    // 2. tenter d'ajouter les mots suivants (Brute-Force)
    for (int k = 1; k < nbre_mots; k++)
    {
        // reucperation du mot csuivant apres le premier mot
        char *current_word = lexicon[k];

        // variable pour suivre si le mot a ete place ou non
        bool nature_position = false;

        // itérer sur chaque cellule (r, c) comme point de départ possible
        // essaye tout les positions possibles de la grille
        for (int r = 0; r < taille_grille_ligne && !nature_position; r++)
        {
            for (int c = 0; c < taille_grille_colonne && !nature_position; c++)
            {

                // si le mot valide tout les regles de placement  alors il peut etre place dans la grille
                if (placement_valide(grille, current_word, r, c, HORIZONTAL))
                {
                    place_word(grille, current_word, r, c, HORIZONTAL);
                    nature_position = true;
                    mot_places++;
                }

                // essayer l'orientation Verticale (direction  = 1)
                else if (placement_valide(grille, current_word, r, c, VERTICAL))
                {
                    place_word(grille, current_word, r, c, VERTICAL);
                    nature_position = true;
                    mot_places++;
                }
            }
        }

        // afficher les mots qui n'ont pas pu etre places
        if (!nature_position)
        {
            printf("Avertissement: Le mot '%s' n'a pas pu être placé.\n", current_word);
        }
    }

    // afficher le nombre total de mots places
    printf("Total des mots placés dans la grille: %d\n", mot_places);
}

// fonction pour compter le nombre d'intersections possibles lors du placement d'un mot
int count_intersections_at_placement(char grille[taille_grille_ligne][taille_grille_colonne], char *word, int row, int col, int dir)
{
    int len = strlen(word);
    int intersections = 0;

    // Si le placement est invalide (vérification rapide des limites et extrémités)
    // NOTE: utiliser la fonction française `placement_valide` définie plus haut
    if (!placement_valide(grille, word, row, col, dir))
    {
        return -1;
    }

    // Si valide, on recompte les intersections (le corps de is_valid_placement le faisait déjà)
    // On ne fait que parcourir et compter, car la validité est déjà assurée.
    for (int i = 0; i < len; i++)
    {
        int r = (dir == HORIZONTAL) ? row : row + i;
        int c = (dir == HORIZONTAL) ? col + i : col;

        if (grille[r][c] != vide && grille[r][c] == word[i])
        {
            intersections++;
        }
    }

    // Critère d'intersection finale (Règle 1: No intersection)
    bool grid_is_empty = (grille[taille_grille_ligne / 2][taille_grille_colonne / 2] == vide);
    if (!grid_is_empty && intersections == 0)
    {
        return -1; // Bien que is_valid_placement ait dit OK, on retourne -1 si le mot doit croiser
    }

    return intersections;
}

// fonction de comparaison pour qsort : trie les indices par longueur de mot décroissante.

int compare_word_lengths(const void *a, const void *b)
{
    // les pointeurs a et b pointent vers des indices (int) dans le tableau des indices.
    int index_a = *(const int *)a;
    int index_b = *(const int *)b;

    // Utiliser le lexique courant fourni via `current_lexicon` (défini avant l'appel à qsort)
    if (current_lexicon == NULL)
        return 0; // sécurité

    int len_first_word = strlen(current_lexicon[index_a]);
    int len_second_word = strlen(current_lexicon[index_b]);

    // trie décroissant (plus long en premier): retourner >0 si a doit venir après b
    return len_second_word - len_first_word;
}

// bonus n°1 : génération 
void generate_crossword_optmise(char grille[taille_grille_ligne][taille_grille_colonne], char lexicon[MAX_WORDS][MAX_WORD_LEN], int n_words) {
    if (n_words == 0) return;

    // 1. préparer l'ordre de placement (Trier par longueur décroissante)
    int word_indices[MAX_WORDS];
    for (int i = 0; i < n_words; i++)
    {
        word_indices[i] = i;
    }

    // variable pour compter le nombre de mots places
    int mot_places = 0;

    // trie l'array d'indices en utilisant la fonction de comparaison basée sur lexicon
    //  fournir le lexique courant au comparateur via la variable globale temporaire
    current_lexicon = lexicon;
    qsort(word_indices, n_words, sizeof(int), compare_word_lengths);
    current_lexicon = NULL;

    // 2. placer le premier mot (le plus long) au centre
    int first_word_index = word_indices[0];
    char *first_word = lexicon[first_word_index];
    int start_row = taille_grille_ligne / 2;
    int start_col = taille_grille_colonne / 2 - strlen(first_word) / 2;
    place_word(grille, first_word, start_row, start_col, HORIZONTAL);

    // 3. tenter d'ajouter les mots suivants
    for (int k = 1; k < n_words; k++)
    {
        int current_lexicon_index = word_indices[k];
        char *current_word = lexicon[current_lexicon_index];

        // initialisation des variables pour le meilleur emplacement
        int best_r = -1, best_c = -1, best_dir = -1;
        // initialisation du nombre maximum d'intersections trouvées
        int max_intersections = -1;
        // initialisation de la variable pour suivre si le mot a ete place ou non
        bool placed = false;

        // Chercher le meilleur emplacement (max intersections)
        for (int r = 0; r < taille_grille_ligne; r++)
        {
            for (int c = 0; c < taille_grille_colonne; c++)
            {

                // essayer l'orientation Horizontale
                int inter_H = count_intersections_at_placement(grille, current_word, r, c, HORIZONTAL);
                if (inter_H > max_intersections)
                {
                    max_intersections = inter_H;
                    best_r = r;
                    best_c = c;
                    best_dir = HORIZONTAL;
                    placed = true;
                }

                // essayer l'orientation Verticale
                int inter_V = count_intersections_at_placement(grille, current_word, r, c, VERTICAL);
                if (inter_V > max_intersections)
                {
                    max_intersections = inter_V;
                    best_r = r;
                    best_c = c;
                    best_dir = VERTICAL;
                    placed = true;
                    
                }
            }
        }

        // placer le mot au meilleur emplacement trouvé
        if (placed)
        {
            place_word(grille, current_word, best_r, best_c, best_dir);
            mot_places++;
        } else {
            printf("Avertissement: Le mot '%s' n'a pas pu être placé.\n", current_word);
        }
       

  }
  // afficher le nombre total de mots places
    printf("Total des mots placés dans la grille optimisée: %d\n", mot_places);
}
