#ifndef CROSSWORD_H
#define CROSSWORD_H
#include "config.h"

// Initialisation de la grille avec des cases vides
void initialize_grille(char grille[taille_grille_ligne][taille_grille_colonne]);

// Affichage de la grille
void print_grille(char grille[taille_grille_ligne][taille_grille_colonne]);

// fonction de generation factice de la grille
void generation_horizontal(char grille[taille_grille_ligne][taille_grille_colonne], char lexicon[MAX_WORDS][MAX_WORD_LEN], int n_words);
void generation_vertical(char grille[taille_grille_ligne][taille_grille_colonne], char lexicon[MAX_WORDS][MAX_WORD_LEN], int n_words);

// focntion de verification de placement des mots
bool placement_valide(char grille[taille_grille_ligne][taille_grille_colonne], char *word, int row, int col, int dir);
// generation final de la grille de mots croisés
void generation_final(char grille[taille_grille_ligne][taille_grille_colonne], char lexicon[MAX_WORDS][MAX_WORD_LEN], int n_words);
//fonction pour generer une indice aleatoire pour le placement des mots
int get_indice_alea_valide(int taille_colonne, char mot[]);

// Place un mot dans la grille à une position donnée dans une certaine direction
void place_word(char grille[taille_grille_ligne][taille_grille_colonne], char *word, int row, int col, int dir);

// bonus 1
// fonction pour compter le nombre d'intersection possible d'un mot dans la grille
int compter_intersections(char grille[taille_grille_ligne][taille_grille_colonne], char *word, int row, int col, int direction);
void generate_crossword_optmise(char grille[taille_grille_ligne][taille_grille_colonne], char lexicon[MAX_WORDS][MAX_WORD_LEN], int n_words);
int compare_word_lengths(const void *a, const void *b);

#endif