#include <stdio.h>
#include <stdlib.h>
#include "lexicon.c"
#include "utile.c"
#include <string.h>

/**
 * genere la matrice horizonttale
 */
int genere_mat_verticale(char res[MAX_WORDS][MAX_WORD_SIZE])
{
    genere_mat_vide(MAX_WORDS, MAX_WORD_SIZE, res);
    int cpt;
    for (int k = 0; k < 3; k++)
    {
        char mat[MAX_WORDS][MAX_WORD_SIZE];
        system("shuf -n 10 ../lexicon-american > tmp");
        read_lexicon("tmp", mat, &cpt);
        for (int i = 0; i < MAX_WORDS; i++)
        {
            int indice = get_indice_alea_valide(MAX_WORDS, mat[i]);
            if (indice == -1)
            {
                continue;
                //  a revoir popur le remplcer evite davoir des colonnes vide
            }
            for (int j = 0; j < strlen(mat[i]); j++)
            {
                res[indice][i + (k * 10)] = mat[i][j];
                indice = indice + 1;
            }
        }
        system("rm tmp");
    }
    return 0;
}
/**
 * main pour tester les fonctions
 */
int main()
{
    char tab[MAX_WORDS][MAX_WORD_SIZE];
    genere_mat_verticale(tab);
    imprime_mat(MAX_WORDS, MAX_WORD_SIZE, tab);
    return 0;
}