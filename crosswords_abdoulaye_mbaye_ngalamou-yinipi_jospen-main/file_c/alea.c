/*Source Code From Laure Gonnord*/
/*Code pour le TP4 de Programmation Structurée*/
/*IMA, Polytech'Lille, 2012*/

#include <stdlib.h>
#include <time.h>

/*initialisation du generateur*/
void initialise_rand()
{
  srand(time(NULL));
}

/*tire un entier au hasard entre inf et sup */
int hasard(int inf, int sup)
{
  int rando = rand();
  return (inf + (rando % (sup - inf + 1)));
}