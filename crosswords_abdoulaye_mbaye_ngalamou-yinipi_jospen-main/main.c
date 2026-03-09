
#include <stdio.h>
#include <string.h>
#include <stdbool.h>
#include <stdlib.h>
#include <time.h>
#include "crossword.h"
#include "lexicon.h"

// foction prappel de lexique 
void lexique(char lexicon[MAX_WORDS][MAX_WORD_LEN], int *lexicon_size) {
    // faire varier le contenue de lexicon en fonction du fichier lu
    system("shuf -n 500 lexicon-american > lexique_final.txt");

    // appel de la fonction read_lexicon pour lire le lexique depuis un fichier
    read_lexicon("lexique_final.txt", lexicon, lexicon_size);
}


int main(void)
{

  // creation de la variable pour contenir la grille
  char grille[taille_grille_ligne][taille_grille_colonne];

  // initialisation de la grille
  initialize_grille(grille);
  // variable pour contenir le premier mot de la grille recupere de maniere aleatoire
  char lexicon[MAX_WORDS][MAX_WORD_LEN];
  int lexicon_size = 0;

  lexique(lexicon, &lexicon_size);

  // appel de la fonction d'optimisation de la generation de la grille
    // Menu interactif pour que l'utilisateur choisisse une option
  if (lexicon_size == 0) {
    fprintf(stderr, "Erreur: le lexique est vide. Impossible de générer des grilles.\n");
    return 1;
  }

    // initialisation du choinx de l'utilisateur 
    int choix = -1;
    while (choix != 0) {
      printf("\n=== Menu du jeu de mots croisés ===\n");
      printf("1. Afficher la grille vide\n");
      printf("2. Afficher une grille horizontale (exemple)\n");
      printf("3. Afficher une grille verticale (exemple)\n");
      printf("4. Générer la grille finale de mots croisés\n");
      printf("5. Générer la grille optimisée de mots croisés\n");
      printf("0. Quitter\n");
      printf("Choix: ");

      if (!(scanf("%d", &choix))) {  // verifcation de la mise en memoire du choix de l'utilisateur
        // entrée invalide : vider le buffer et recommencer
        int c;
        while ((c = getchar()) != '\n' && c != EOF) { }
        printf("Entrée invalide, veuillez entrer un nombre.\n");
        continue;
      }


      // execution du choix en fonction de l'option choisie
      switch (choix) {
        case 1:
        
          initialize_grille(grille);
          print_grille(grille);
          break;
        case 2:
        lexique(lexicon, &lexicon_size);
          initialize_grille(grille);
          // Affichage d'exemple horizontal
          generation_horizontal(grille, lexicon, lexicon_size);
          print_grille(grille);
          break;
        case 3:
        lexique(lexicon, &lexicon_size);
          initialize_grille(grille);
          // Affichage d'exemple vertical
          generation_vertical(grille, lexicon, lexicon_size);
          print_grille(grille);
          break;
        case 4: // generation finale du jeu de mots croisés
        lexique(lexicon, &lexicon_size);
          initialize_grille(grille);
          generation_final(grille, lexicon, lexicon_size);
          print_grille(grille);
          break;
        case 5:  // verdsion optimisée du jeu de mots croisés
          // faire varier le contenue de lexicon en fonction du fichier lu
          lexique(lexicon, &lexicon_size);
          initialize_grille(grille);
          generate_crossword_optmise(grille, lexicon, lexicon_size);
          print_grille(grille);
          break;
        case 0:
          printf("Quitter...\n");
          break;
        default:
          printf("Choix inconnu. Veuillez réessayer.\n");
      }
    }

  return 0;
}
