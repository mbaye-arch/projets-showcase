#ifndef LEXICON_H
#define LEXICON_H
#include "config.h"

// Lit le fichier et remplit le tableau lexicon
void read_lexicon(const char *filename, char lexicon[MAX_WORDS][MAX_WORD_LEN], int *lexicon_size);

#endif