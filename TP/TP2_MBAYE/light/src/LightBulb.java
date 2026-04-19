/**
 * Classe LightBulb représentant une ampoule avec des caractéristiques telles que
 * la puissance, les lumens, la couleur et son état (allumé ou éteint).
 */
public class LightBulb{
    private int puissance;
    private int lumens;
    private String color;
    private boolean isOn;
    /**constructeur de la classe 
     * @param puissance la puissance de la lampe en watts 
     * @param lumens les lumens de la lampe
     * @param color la couleur de la almpe
    */
    public LightBulb(int puissance, int lumens,String color){
        this.puissance= puissance;
        this.lumens = lumens;
        this.color = color;
        this.isOn = false;
    }
    /**methode pour obtenir la puissance
     * @return la puisssance de la lampe 
    */
    public int getWatt(){
        return this.puissance;
    }
    /**methode pour obtenir les lumens
     * @return lumens de la lampe
     */
    public int getLumen(){
        return this.lumens;
    }
    /**methoddes pour obtenir la couleur
     * @return return la couleur de la lampe
    */
    public String getColor(){
        return this.color;
    }

    /**methode pour allumer la lampe et modifier sa valeur isOn
     * met is on a true alllume la lampe
    */
    public void turnOn(){
        this.isOn = true;
    }
    /**methode pour eteindre  la lampe et modifier sa valeur isOn
     *met isOn a false eteint la lampe
    */
    public void turnOff(){
        this.isOn=false;
    }
    /**methode pour savoir si la lampe est allume ou pas 
     * @return donne letat de la lampe allume ou pas 
    */
    public boolean getStatut(){
        return this.isOn;
    }
    /**methode avoir la description de la lampe
     * @return donne une description de la lampe 
    */
    public String toString(){
        String chaine = new String("Puissance : "+this.getWatt()+" W"+"\nLumens : "+this.getLumen()+
        "\nCouleur : "+this.getColor());
        if (this.isOn){
            chaine =chaine + "\nAllumée";
        }
        else{
            chaine = chaine +"\nÉteint";
        }
        return chaine;
    }
        /** compare deux ampoules 
     * @return return true si deux ampoules sont egales et false dena sle cas contraire 
     */
    public boolean equals(Object o){
        if (!(o instanceof LightBulb))
            return false;
        LightBulb other = (LightBulb) o;
        return (this.puissance==other.puissance)&&(this.lumens ==other.lumens)&&(this.color==other.color);

    }
}
