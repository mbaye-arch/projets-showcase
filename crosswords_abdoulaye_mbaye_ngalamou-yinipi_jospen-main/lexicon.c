#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "lexicon.h"

void read_lexicon(const char *filename, char lexicon[MAX_WORDS][MAX_WORD_LEN], int *lexicon_size)
{
    FILE *lex_file = fopen(filename, "r");
    if (lex_file == NULL)
    {
        fprintf(stderr, "Erreur: Impossible d'ouvrir %s\n", filename);
        exit(1);
    }

    *lexicon_size = 0;
    while (*lexicon_size < MAX_WORDS && fscanf(lex_file, "%s", lexicon[*lexicon_size]) != EOF)
    {
        // On ne garde que les mots qui rentrent dans la grille
        if (strlen(lexicon[*lexicon_size]) < taille_grille_colonne)
        {
            (*lexicon_size)++;
        }
    }
    fclose(lex_file);
}