package io;

/**
 * example of use of io.Input methods
 * */
public class InputMain {

   // example of use util class Input
   public static void main(String[] args) {
      //
      // example for String input
      //
      System.out.print(" give a String : ? ");
      String userString = Input.readString();
      System.out.println("your String value was => " + userString);
      //
      System.out.println();
      //
      // example for int input : tant que la valeur saisie n'est pas un entier on
      // redemande
      // esssayez en saisissant une valeur incorrecte avant de saisir un nombre
      //
      boolean ok = false; // true only when an integer has been given
      while (!ok) {       
         try {
            System.out.print(" give an int : ? ");
            int userInt = Input.readInt();
            ok = true;    // no exception : input was an int value
            System.out.println("your int was => " + userInt);
         } catch (java.io.IOException e) {
            // "exception... : input does not correspond to an integer            
            ok = false;    // not really necessary, ok is already false
            System.out.println("wrong input : please give an int");
         }         
      }
   }
}// Input
