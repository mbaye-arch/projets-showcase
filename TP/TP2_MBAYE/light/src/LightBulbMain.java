/**creation de la classe Main pour les programme dans l'exercice
*/
public class LightBulbMain {
    /**
     * classe pour les programmes a ecrire 
     * @param args les arguments de commande 
     */
    public static void main(String[] args) {
        LightBulb light =new LightBulb(4,1200,"blanche");
        LightSwitch switch1 = new LightSwitch(light);
        System.out.println(light.toString());
        switch1.push();
        System.out.println(light.toString());        
    }
}
