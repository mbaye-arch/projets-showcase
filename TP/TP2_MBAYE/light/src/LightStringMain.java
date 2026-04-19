/**Class pour executer les programmes donne dans lexercice guirlandes  */
public class LightStringMain {
    public static void main(String[] args) {
        LightString guirlande = new LightString(10);
        System.out.println(guirlande.toString());
        System.out.println("Puissance Consomme : "+guirlande.getConsumedPower() +" Watts");
        guirlande.turnOn();
        System.out.println("allumage");
        System.out.println("Puissance Consomme : "+guirlande.getConsumedPower() +" Watts");
        guirlande.changeLightbulb(4,new LightBulb(2, 120, "jaune"));
        guirlande.turnOn();
        System.out.println("changement");
        guirlande.turnOn();
        System.out.println("Puissance Consomme : "+guirlande.getConsumedPower() +" Watts");
        System.out.println(guirlande.toString());

    }
}