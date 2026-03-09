#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <string.h>
#include "alea.c"
/**
 * print la matrice
 * @param ligne : nombre de ligne de la matrice
 * @param colonne : nombre de colonne de la matrice
 * @param mat : la matrice a imprimer
 */
void imprime_mat(int ligne, int colonne, char mat[ligne][colonne])
{
    /* Print column indices */
    printf("\n    ");
    for (int i = 0; i < colonne; i++)
    {
        printf(" %2d ", i);
    }
    printf("\n");

    for (int i = 0; i < ligne; i++)
    {
        printf("%2d   ", i);
        for (int j = 0; j < colonne; j++)
        {
            if (mat[i][j] == ' ')
            {
                printf(" .  ");
            }
            else
            {
                printf(" %c  ", mat[i][j]);
            }
        }
        printf("\n");
    }
    printf("\n");
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