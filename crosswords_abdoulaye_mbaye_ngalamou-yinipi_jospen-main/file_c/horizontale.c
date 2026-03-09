#include <stdio.h>
#include <stdlib.h>
#include "lexicon.c"
#include "utile.c"
#include <string.h>

/**
 * genere la matrice horizonttale
 */
int genere_mat_horizontale(char res[MAX_WORDS][MAX_WORD_SIZE])
{
    char mat[MAX_WORDS][MAX_WORD_SIZE];
    genere_mat_vide(MAX_WORDS, MAX_WORD_SIZE, res);
    int cpt;
    system("shuf -n 10 ../lexicon-american > tmp");
    read_lexicon("tmp", mat, &cpt);
    for (int i = 0; i < MAX_WORDS; i++)
    {
        int indice = get_indice_alea_valide(MAX_WORD_SIZE, mat[i]);
        for (int j = 0; j < strlen(mat[i]); j++)
        {
            res[i][indice] = mat[i][j];
            indice = indice + 1;
        }
    }
    system("rm tmp");
    return 0;
}
/**
 * main pour tester les fonctions
 */
int main()
{
    char tab[MAX_WORDS][MAX_WORD_SIZE];
    genere_mat_horizontale(tab);
    imprime_mat(MAX_WORDS, MAX_WORD_SIZE, tab);
    return 0;
}