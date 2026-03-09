#include <stdio.h>
#include <string.h>
#include <stdbool.h>
#include <stdlib.h>
#include <time.h>
#include "lexicon.c"
/**
 * explication sur la version jouable
 * dans cette version jouable nous avons implemente une fonction de jeu principale game()
 * cette fonction permet a l'utilisateur de jouer au jeu de mots croises en plaçant les
 * mots dans la grille en fonction des coordonnes et de l'alignement qu'il choisit
 * la grille est generee aleatoirement a chaque execution du programme
 * l'utilisateur doit saisir les coordonnes (ligne, colonne) et l'alignement (
 * 0 pour horizontal, 1 pour vertical) du mot qu'il veut placer
 * si le placement est correct le mot est place dans la grille et le flag est mis a 1
 * sinon l'utilisateur doit ressaisir les coordonnes et l'alignement jusqua ce qu'il place tous les mots
 * le jeu se termine lorsque tous les mots sont places dans la grille
 */

/**
 * cette fonction initialise la grille avec des caractères vides
 * @param grille : la grille a initialiser
 */
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
/**
 * fonction pour placier un mot dans la grille
 * direction  c'est la direction ection pour placer le mot : 0 pour horizontal, 1 pour vertical
 * @param grille : la grille ou placer le mot
 * @param word : le mot a placer
 * @param row : la ligne de depart
 * @param col : la colonne de depart
 * @param direction : la direction de placement
 */
void place_word(char grille[taille_grille_ligne][taille_grille_colonne], char *word, int row, int col, int direction)
{
    int len = strlen(word);

    // Vérifier si le mot tient dans la grille
    if (direction == 0)
    { // horizontal
        if (col < 0 || col + len > taille_grille_colonne || row < 0 || row >= taille_grille_ligne)
        {
            printf("Erreur : Mot hors limites (horizontal)\n");
            return;
        }
    }
    else
    { // vertical
        if (row < 0 || row + len > taille_grille_ligne || col < 0 || col >= taille_grille_colonne)
        {
            printf("Erreur : Mot hors limites (vertical)\n");
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
 * fonction pour generer une grille factice avec les most du lexique en horizontal
 * en focntion d'un nombre de mots fixés par nous mêmes
 * @param grille : la grille a generer
 * @param lexicon : le lexique de mots
 * @param nbre_mots : le nombre de mots a placer
 * @return void
 */

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

        for (int k = 0; k < len; k++)
        {
            grille[i][k] = word[k]; // position tousles elemenst de la grille a la ligne i
        }
    }
}
/**
 * fonction pour generer une grille factice avec les most du lexique en vertical
 * en focntion d'un nombre de mots fixés par nous mêmes
 * @param grille : la grille a generer
 * @param lexicon : le lexique de mots
 * @param nbre_mots : le nombre de mots a placer
 * @return void
 */
void generation_vertical(char grille[taille_grille_ligne][taille_grille_colonne], char lexicon[MAX_WORDS][MAX_WORD_LEN], int nbre_mots)
{

    int limit;

    if (nbre_mots < taille_grille_ligne)
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

        for (int k = 0; k < len; k++)
        {
            grille[k][i] = word[k];
        }
    }
}

/**
 * fonction pour verifier les emplacements et les intersections
 * Vérifie si le mot peut être placé à (row, col) dans la direction direction .
 * @param grille : la grille de mots croisés
 * @param word : le mot à placer
 * @param row : la ligne de départ
 * @param col : la colonne de départ
 * @param direction : la direction de placement (0 pour horizontal, 1 pour vertical)
 * @return true si le placement est valide, false sinon
 */
bool placement_valide(char grille[taille_grille_ligne][taille_grille_colonne], char *word, int row, int col, int direction)
{
    int len = strlen(word);
    int intersections = 0;

    //  0. Vérification des limites de la grille
    if (direction == 0)
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
    if (direction == 0)
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
        int r = (direction == 0) ? row : row + i; // en fonction de la direction (vertical ou horizontal)
        int c = (direction == 0) ? col + i : col;

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
            if (direction == 0)
            { // Horizontal: Voisins Verticaux (haut/bas)
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
/**
 * Génère la grille finale de mots croisés en plaçant les mots du lexique.
 * @param grille : la grille de mots croisés à remplir
 * @param lexicon : le lexique de mots
 * @param nbre_mots : le nombre de mots dans le lexique
 * @param mot_places : tableau pour stocker les mots placés
 * @param nb_mots : pointeur vers le nombre de mots placés
 * @param parametres_mots : tableau pour stocker les paramètres des mots placés
 * (ligne, colonne, taille, direction)
 */
void generation_final(char grille[taille_grille_ligne][taille_grille_colonne],
                      char lexicon[MAX_WORDS][MAX_WORD_LEN], int nbre_mots, char mot_places[300][20],
                      int *nb_mots, int parametres_mots[4][300]) // stock ligne colones taille direction des mots places
{
    if (nbre_mots == 0)
        return;

    // 1. placer le premier mot au centre de la grille
    // on le place verticalement. On peut le centrer pour un meilleur départ.
    char *first_word = lexicon[0];
    int start_row = taille_grille_ligne / 2;
    int start_col = taille_grille_colonne / 2 - strlen(first_word) / 2;
    place_word(grille, first_word, start_row, start_col, 1); // 0 pour horizontal
    int m = 0;
    // 2. tenter d'ajouter les mots suivants (Brute-Force)
    for (int k = 1; k < nbre_mots; k++)
    {
        // reucperation du mot csuivant apres le premier mot
        char *current_word = lexicon[k];

        // variable pour suivre si le mot a ete place ou non
        bool nature_position = false;

        // Itérer sur chaque cellule (r, c) comme point de départ possible
        // essaye tout les positions possibles de la grille
        for (int r = 0; r < taille_grille_ligne && !nature_position; r++)
        {
            for (int c = 0; c < taille_grille_colonne && !nature_position; c++)
            {

                // si le mot valide tout les regles de placement  alors il peut etre place dans la grille
                if (placement_valide(grille, current_word, r, c, 0))
                {
                    place_word(grille, current_word, r, c, 0);
                    strcpy(mot_places[m], current_word);
                    parametres_mots[0][m] = r;                    // ligne
                    parametres_mots[1][m] = c;                    // colonne
                    parametres_mots[2][m] = strlen(current_word); // taille
                    parametres_mots[3][m] = 0;                    // direction
                    nature_position = true;
                    (*nb_mots)++;
                    m++;
                }

                // Essayer l'orientation Verticale (direction  = 1)
                else if (placement_valide(grille, current_word, r, c, 1))
                {
                    place_word(grille, current_word, r, c, 1);
                    strcpy(mot_places[m], current_word);
                    parametres_mots[0][m] = r;                    // ligne
                    parametres_mots[1][m] = c;                    // colonne
                    parametres_mots[2][m] = strlen(current_word); // taille
                    parametres_mots[3][m] = 1;                    // direction
                    nature_position = true;
                    (*nb_mots)++;
                    m++;
                }
            }
        }
    }
}

/**
 * genere le tableau des flags pour savoir les mots deja places
 * @param tab : le tableau des flags
 * @param mat : la matrice de la grille
 * @return void
 */
void genere_tab_flag(int tab[3][taille_grille_ligne * taille_grille_colonne], char mat[taille_grille_ligne][taille_grille_colonne])
{
    int k = 0;
    for (int i = 0; i < taille_grille_ligne; i++)
    {
        for (int j = 0; j < taille_grille_colonne; j++)
        {
            if (mat[i][j] != vide)
            {
                tab[0][k] = i;
                tab[1][k] = j;
                tab[2][k] = 0;
                k++;
            }
        }
    }
}

/**
 * cette fonction renvoie le flag d'une case donnee
 * @param tab : le tableau des flags
 * @param x : la ligne
 * @param y : la colonne
 * @return le flag de la case (x,y)
 */
int get_flag(int tab[3][taille_grille_ligne * taille_grille_colonne], int x, int y)
{
    for (int i = 0; i < taille_grille_ligne * taille_grille_colonne; i++)
    {
        if (tab[0][i] == x && tab[1][i] == y)
        {
            return tab[2][i];
        }
    }
    return -1;
}
/**
 * cette fonction met a jour le flag d'une case donnee
 * @param tab : le tableau des flags
 * @param x : la ligne
 * @param y : la colonne
 * @param value : la valeur du flag
 */
int affiche_mot(char mot_place[300][20], int nbr_mot)
{
    int choix = -1;
    for (int i = 0; i < nbr_mot; i++)
    {
        printf("%d . %s\n", i, mot_place[i]);
    }
    printf("choisissez le mot que vous voulez placer : ");
    scanf("%d", &choix);
    while (choix < 0 || choix > nbr_mot)
    {
        printf("choix invalide! ressaisir : ");
        scanf("%d", &choix);
    }
    printf("vous avez choisi le mot : %s\n", mot_place[choix]);
    return choix;
}
/**
 * imprime la matrice avec des asterix dessus
 * @param mat : la matrice a imprimer
 * @param tab : le tableau des flags
 * @return void
 */
void imprime_mat_v2(char mat[taille_grille_ligne][taille_grille_colonne], int tab[3][taille_grille_ligne * taille_grille_colonne])
{
    printf("\n    ");
    for (int j = 0; j < taille_grille_colonne; j++)
        printf(" %2d ", j);
    printf("\n");

    for (int i = 0; i < taille_grille_ligne; i++)
    {
        printf("%2d   ", i);
        for (int j = 0; j < taille_grille_colonne; j++)
        {
            if ((mat[i][j] == vide) || (get_flag(tab, i, j) == 1))
            {
                printf(" %c  ", mat[i][j]);
            }
            else
            {
                printf(" *  ");
            }
        }
        printf("\n");
    }
}
/**
 * cette fonction renvoie les coordonnes du mot deja dans le grille pour mettre leur flag a 1
 * @param mot : le mot a chercher
 * @param grille : la grille de mots croises
 * @param ligne : la ligne du mot trouve
 * @param colonne : la colonne du mot trouve
 * @param alignement : l'alignement du mot trouve (0 pour horizontal,
 * 1 pour vertical)
 * @return void
 */
void get_coordonnees_mot(char mot[], char grille[taille_grille_ligne][taille_grille_colonne], int *ligne, int *colonne, int *alignement)
{
    int len = strlen(mot);
    for (int i = 0; i < taille_grille_ligne; i++)
    {
        for (int j = 0; j < taille_grille_colonne; j++)
        {
            // verifier l'alignement horizontal
            if (j + len <= taille_grille_colonne)
            {
                bool match = true;
                for (int k = 0; k < len; k++)
                {
                    if (grille[i][j + k] != mot[k])
                    {
                        match = false;
                        break;
                    }
                }
                if (match)
                {
                    *ligne = i;
                    *colonne = j;
                    *alignement = 0; // horizontal
                    return;
                }
            }
            // verifier l'alignement vertical
            if (i + len <= taille_grille_ligne)
            {
                bool match = true;
                for (int k = 0; k < len; k++)
                {
                    if (grille[i + k][j] != mot[k])
                    {
                        match = false;
                        break;
                    }
                }
                if (match)
                {
                    *ligne = i;
                    *colonne = j;
                    *alignement = 1; // vertical
                    return;
                }
            }
        }
    }
}

/**
 * cette fonction demande a l'utilisateur de saisir les coordonnes et l'alignement
 * @param ligne : la ligne a saisir
 * @param col : la colonne a saisir
 * @param alignement : l'alignement a saisir
 * @param taille_ligne : la taille de la grille en ligne
 * @param taille_colonne : la taille de la grille en colonne
 */
void demande_saisis_col_ligne_alignement(int *ligne, int *col, int *alignement, int taille_ligne, int taille_colonne)
{
    printf("saisir la ligne,colonne et alignement de depart du mot (ligne,colonne,alignement) :\n");
    scanf("%d,%d,%d", ligne, col, alignement);
    // verifier si les coordonnes sont valides
    while (*ligne < 0 || *ligne >= taille_ligne || *col < 0 || *col >= taille_colonne || (*alignement != 0 && *alignement != 1))
    {
        printf("coordonnees invalides! ressaisir :\n");
        scanf("%d,%d,%d", ligne, col, alignement);
    }
}

/**
 * cette fontion verifie la saisie de l'utilisateur et le placement du mot
 * @param ligne : la ligne saisie
 * @param colonne : la colonne saisie
 * @param aligenement : l'alignement saisi
 * @param mot : le mot a placer
 * @param parametres : le tableau des parametres des mots places
 * @param grille : la grille de mots croises
 * @param mots_place : le tableau des mots places
 * @param nbre_mot : le nombre de mots places
 * @return true si la saisie et le placement sont corrects, false sinon
 */
bool verifie_saisie_et_placement(int ligne, int colonne, int aligenement, char mot[],
                                 int parametres[4][300], char grille[taille_grille_ligne][taille_grille_colonne], char mots_place[300][20], int nbre_mot)
{
    int inidice_mot = -1;
    // chercher l'indice du mot dans le tableau des mots places
    for (int i = 0; i < nbre_mot; i++)
    {
        if (strcmp(mots_place[i], mot) == 0)
        {
            inidice_mot = i;
            break;
        }
    }
    if (inidice_mot == -1)
    {
        printf("Erreur: Mot non trouvé dans la liste des mots placés.\n");
        return false;
    }
    // verifier si les coordonnes saisies correspondent aux coordonnes du mot
    if (parametres[0][inidice_mot] != ligne || parametres[1][inidice_mot] != colonne || parametres[3][inidice_mot] != aligenement)
    {
        printf("Erreur: Coordonnées ou alignement incorrect pour le mot '%s'.\n", mot);
        return false;
    }
    else
    {
        return true;
    }
}

/**
 * cette fonction met a jour le flag d'une case donnee
 * @param flag : le tableau des flags
 * @param mot : le mot a placer
 * @param ligne : la ligne de depart
 * @param colonne : la colonne de depart
 * @param alignement : l'alignement du mot (0 pour horizontal, 1
 * pour vertical)
 * @return void
 */
void modifie_flag(int flag[3][taille_grille_ligne * taille_grille_colonne], char mot[], int ligne, int colonne, int alignement)
{
    int len = strlen(mot);
    for (int i = 0; i < len; i++)
    {
        if (alignement == 0) // horizontal
        {
            for (int k = 0; k < taille_grille_ligne * taille_grille_colonne; k++)
            {
                if (flag[0][k] == ligne && flag[1][k] == colonne + i)
                {
                    flag[2][k] = 1;
                }
            }
        }
        else // vertical
        {
            for (int k = 0; k < taille_grille_ligne * taille_grille_colonne; k++)
            {
                if (flag[0][k] == ligne + i && flag[1][k] == colonne)
                {
                    flag[2][k] = 1;
                }
            }
        }
    }
}

/**
 * cette fonction supprime un mot du tableau des mots places
 * @param mot_place : le tableau des mots places
 * @param nbr_mot : le nombre de mots places
 * @param index : l'indice du mot a supprimer
 * @param parametres : le tableau des parametres des mots places
 * @return void
 */
void deletemot(char mot_place[300][20], int *nbr_mot, int index, int parametres[4][300])
{
    for (int i = index; i < (*nbr_mot) - 1; i++)
    {
        strcpy(mot_place[i], mot_place[i + 1]);
        parametres[0][i] = parametres[0][i + 1]; // ligne
        parametres[1][i] = parametres[1][i + 1]; // colonne
        parametres[2][i] = parametres[2][i + 1]; // taille
        parametres[3][i] = parametres[3][i + 1]; // direction
    }
    (*nbr_mot)--;
}

/**
 * cette fonction affiche un mot de depart cho  isi aleatoirement
 * equivaut a dire met son flag a 1
 * @param flag : le tableau des flags
 * @param mot_place : le tableau des mots places
 * @param nbre_mot : le nombre de mots places
 * @param grille : la grille de mots croises
 * @return void
 */
void affiche_mot_aleatoire(int flag[3][taille_grille_ligne * taille_grille_colonne], char mot_place[300][20],
                           int nbre_mot, char grille[taille_grille_ligne][taille_grille_colonne])
{
    srand(time(NULL));
    int random_index = rand() % nbre_mot;
    char *mot = mot_place[random_index];
    int ligne, colonne, alignement;
    get_coordonnees_mot(mot, grille, &ligne, &colonne, &alignement);
    modifie_flag(flag, mot, ligne, colonne, alignement);
}

/**
 * fonction de jeu principale
 * @return 0 si le jeu se termine correctement
 */
int game()
{
    // creation de la variable pour contenir la grille
    char grille[taille_grille_ligne][taille_grille_colonne];
    int flag[3][taille_grille_ligne * taille_grille_colonne];
    int parametres_mots[4][300]; // stock ligne colones taille direction des mots places
    char mots_place[300][20];
    int nbre_mot = 0;
    // initialisation de la grille
    initialize_grille(grille);
    // variable pour contenir le premier mot de la grille recupere de maniere aleatoire
    char lexicon[MAX_WORDS][MAX_WORD_LEN];
    int lexicon_size = 0;
    // appel de la fonction read_lexicon pour lire le lexique depuis un fichier
    read_lexicon("lexique_final.txt", lexicon, &lexicon_size);
    generation_final(grille, lexicon, lexicon_size, mots_place, &nbre_mot, parametres_mots); // generer la grille finale de mots croisés
    genere_tab_flag(flag, grille);
    affiche_mot_aleatoire(flag, mots_place, nbre_mot, grille);
    // boucle de jeu
    while (nbre_mot > 0)
    {
        imprime_mat_v2(grille, flag);
        printf("%d\n", nbre_mot);
        int choix = affiche_mot(mots_place, nbre_mot);
        char *mot = mots_place[choix];
        int ligne, colonne, alignement;
        demande_saisis_col_ligne_alignement(&ligne, &colonne, &alignement, taille_grille_ligne, taille_grille_colonne);
        if (verifie_saisie_et_placement(ligne, colonne, alignement, mot, parametres_mots, grille, mots_place, nbre_mot))
        {
            printf("Bravo! Vous avez placé le mot '%s' correctement.\n", mot);
            modifie_flag(flag, mot, ligne, colonne, alignement);
            deletemot(mots_place, &nbre_mot, choix, parametres_mots);
        }
        else
        {
            printf("Désolé, placement incorrect pour le mot '%s'. Réessayez.\n", mot);
        }
    }
    imprime_mat_v2(grille, flag);
    printf("Félicitations! Vous avez complété la grille de mots croisés.\n");
    return 0;
}
/**
 * main pour faire tourner le jeu
 */
int main()
{
    game();
    return 0;
}
