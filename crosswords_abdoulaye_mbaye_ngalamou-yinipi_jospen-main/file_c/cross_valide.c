#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include "lexicon.c"
#define nb_ligne 20
#define nb_colonne 20
#define vide '.'
/**
 * cette fontion genere une matrice avec des case contenant un point
 */
int genere_mat_vide(char mat[nb_ligne][nb_colonne])
{
    for (int i = 0; i < nb_ligne; i++)
    {
        for (int j = 0; j < nb_colonne; j++)
        {
            mat[i][j] = vide;
        }
    }
    return 0;
}
/**
 * imprilme la matrice
 */
void imprime_mat(char mat[nb_ligne][nb_colonne])
{
    printf("\n    ");
    for (int j = 0; j < nb_colonne; j++)
        printf(" %2d ", j);
    printf("\n");

    for (int i = 0; i < nb_ligne; i++)
    {
        printf("%2d   ", i);
        for (int j = 0; j < nb_colonne; j++)
        {
            printf(" %c  ", mat[i][j]);
        }
        printf("\n");
    }
}

/**
 * cette fontion verifie si un mot peut etre place horizontalement a la position x y
 */
bool peut_placer_horizontal(char mat[nb_ligne][nb_colonne], char *mot, int x, int y)
{
    int len = strlen(mot);
    // verifie si le mot depasse les limites de la grille
    if (y + len > nb_colonne)
        return false;
    // verifie si les cases sont libres
    for (int j = 0; j < len; j++)
    {
        if (mat[x][y + j] != vide && mat[x][y + j] != mot[j])
        {
            return false;
        }
    }
    // verifie les cases avant et apres le mot pour eviter les collisions
    // case avant le mot
    if (y > 0 && mat[x][y - 1] != vide)
    {
        return false;
    }
    // case apres le mot
    if (y + len < nb_colonne && mat[x][y + len] != vide)
    {
        return false;
    }

    // si toutes les conditions sont remplies, le mot peut etre place
    return true;
}
/**
 * cette fontion verifie si un mot peut etre place verticalement a la position x y
 */
bool peut_placer_vertical(char mat[nb_ligne][nb_colonne], char *mot, int x, int y)
{
    // verifie si le mot peut etre place verticalement a la position (x, y)
    int len = strlen(mot);
    // verifie si le mot depasse les limites de la grille
    if (x + len > nb_ligne)
        return false;
    // verifie si les cases sont libres
    for (int i = 0; i < len; i++)
    {
        if (mat[x + i][y] != vide && mat[x + i][y] != mot[i])
        {
            return false;
        }
    }
    // verifie les cases avant et apres le mot pour eviter les collisions
    // case avant le mot
    if (x > 0 && mat[x - 1][y] != vide)
    {
        return false;
    }
    // case apres le mot
    if (x + len < nb_ligne && mat[x + len][y] != vide)
    {
        return false;
    }

    // si toutes les conditions sont remplies, le mot peut etre place
    return true;
}

/**
 * cette fontion place un mot horizontalement a la position x y
 */
void place_horizontal(char mat[nb_ligne][nb_colonne], char *mot, int x, int y)
{
    // place le mot horizontalement a la position x, y
    int len = strlen(mot);
    for (int j = 0; j < len; j++)
    {
        mat[x][y + j] = mot[j];
    }
}
/**
 * cette fontion place un mot verticalement a la position x y
 */
void place_vertical(char mat[nb_ligne][nb_colonne], char *mot, int x, int y)
{
    int len = strlen(mot);
    for (int i = 0; i < len; i++)
    {
        mat[x + i][y] = mot[i];
    }
}
/**
 * cette fontion essaye de placer un mot dans la grille
 */
bool essaye_placer_mot(char mat[nb_ligne][nb_colonne], char *mot)
{
    int len = strlen(mot);

    // Essayer de placer avec intersections
    for (int i = 0; i < nb_ligne; i++)
    {
        for (int j = 0; j < nb_colonne; j++)
        {
            if (mat[i][j] == vide)
                continue; // on cherche une lettre existante

            for (int k = 0; k < len; k++)
            {
                if (mat[i][j] == mot[k])
                {
                    // essayer horizontalement lettre sur mat[i][j]
                    int debut_col = j - k;
                    if (debut_col >= 0 && debut_col + len <= nb_colonne)
                    {
                        if (peut_placer_horizontal(mat, mot, i, debut_col))
                        {
                            place_horizontal(mat, mot, i, debut_col);
                            return true;
                        }
                    }

                    // essayer verticalement
                    int debut_ligne = i - k;
                    if (debut_ligne >= 0 && debut_ligne + len <= nb_ligne)
                    {
                        if (peut_placer_vertical(mat, mot, debut_ligne, j))
                        {
                            place_vertical(mat, mot, debut_ligne, j);
                            return true;
                        }
                    }
                }
            }
        }
    }

    // si aucune intersection possible, placer sans intersection
    // parcourir toute la grille
    for (int i = 0; i < nb_ligne; i++)
    {
        for (int j = 0; j < nb_colonne; j++)
        {
            // essayer horizontalement
            if (peut_placer_horizontal(mat, mot, i, j))
            {
                // placer le mot
                place_horizontal(mat, mot, i, j);
                return true;
            }
            // essayer verticalement
            if (peut_placer_vertical(mat, mot, i, j))
            {
                // placer le mot
                place_vertical(mat, mot, i, j);
                return true;
            }
        }
    }

    // impossible de placer le mot
    return false;
}

/**
 * place le premier mot au centre de la grille, horizontalement
 */
void place_premier_mot(char mat[nb_ligne][nb_colonne], char *mot)
{
    int len = strlen(mot);

    // sécurité : si le mot est trop long, on ne fait rien
    if (len > nb_colonne)
        return;

    int ligne = nb_ligne / 2;
    int colonne = (nb_colonne - len) / 2;

    for (int j = 0; j < len; j++)
    {
        mat[ligne][colonne + j] = mot[j];
    }
}

int main(void)
{
    char grille[nb_ligne][nb_colonne];
    char lexicon[MAX_WORDS][MAX_WORD_SIZE];
    int lexicon_size;

    // melange du lexique avec shuf (fichier temporaire)
    system("shuf -n 10 ../lexicon-american > tmp_lex.txt");

    read_lexicon("tmp_lex.txt", lexicon, &lexicon_size);

    genere_mat_vide(grille);

    // premier mot au centre
    place_premier_mot(grille, lexicon[0]);

    // placement des autres mots
    for (int i = 1; i < lexicon_size; i++)
    {
        essaye_placer_mot(grille, lexicon[i]);
    }

    imprime_mat(grille);

    // suppression du fichier temporaire
    system("rm tmp_lex.txt");

    return 0;
}