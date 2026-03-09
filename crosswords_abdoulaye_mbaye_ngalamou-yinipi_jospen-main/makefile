
all : mainFinal run 

run: mainFinal
	./mainFinal	

run_jouable : cross_jouable.out
	./cross_jouable.out

mainFinal : main.o crossword.o lexicon.o alea.o
	gcc -o mainFinal main.o crossword.o lexicon.o alea.o

main.o : main.c lexicon.h crossword.h config.h
	gcc -Wall -o main.o -c main.c	

crossword.o : crossword.c crossword.h config.h
	gcc -c -Wall -o crossword.o crossword.c	

lexicon.o : lexicon.c lexicon.h config.h
	gcc -c -Wall -o lexicon.o lexicon.c	

alea.o : alea.c alea.h 
	gcc -c -Wall -o alea.o alea.c	


cross_jouable.out : cross_jouable.c config.h
	gcc -o cross_jouable.out cross_jouable.c -Wall

.PHONY : all run