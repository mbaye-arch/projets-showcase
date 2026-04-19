/**Class guirlande compose d'ampoules et dune interrupteurs switch */
public class LightString {
    private int nblight;
    private LightBulb[] lights;
    private LightSwitch switch1;
    
    /**constructeurs de la guirlande 
     * @param nblight nombre de lampes dans la guirlande 
     */
    public LightString(int nblight){
        this.lights = new LightBulb[nblight];
        LightBulb light = new LightBulb(1, 100, "blanche");
        this.switch1 = new LightSwitch(light);
        for (int i =0; i<getNbLight();i++){
            this.lights[i]=light;
        }
    }
    /**
     * methode pour obtenir la lampe a la position i en considerant i commence a 1
     * @param i position de la lampe qu'on veut avoir 
     * @return return la lampe a la position i 
     */
    public LightBulb getLightBulb(int i){
        if ((i<=1) && (i<=this.getNbLight())){
            return this.lights[i-1];
        }
        else{
            return null;
        }
    }
    /** replace the n-th lightbulb of the light string by the given lightbulb.
    * Nothing happens if i is not a valid index.
    * @param i the number of the lightbulb to be changed (first has number 1)
    * @param theBulb the new lightbulb
    */
    public void changeLightbulb(int i, LightBulb theBulb){
        if ((i>=1) && (i<=this.getNbLight())){
            this.lights[i-1]=theBulb;
        }
        else{
            System.out.println("pas de lampe a cette possition");
        }
    }
    /**cette methode donne le nombre de lampe de la guirlande en donnant la taille de la liste 
     * 
     * @return le nombre de lampe de la guirlande 
     */
    public int getNbLight(){
        return this.lights.length;
    }
    /**
     * cette methode donne le statut de la guirlande quil soit allume ou pas 
     * @return true si la guirlande est allume false le cas contraire 
     */
    public boolean getStatut(){
        return this.lights[0].getStatut();
    }
    /**donne la puissance lorsque la guirlande est allume
     * 
     * @return la somme des puissances des lampes sur le guirlandes sil sont allumes et 0 sinon 
     */
    public int getConsumedPower(){
        if (this.getStatut()){
            int somme = 0;
            for (int i=0;i<this.getNbLight();i++){
                somme = somme + this.lights[i].getWatt();
            }
            return somme;
        }
        else{
            return 0;
        }
    }
    /**
     * allume  les lampes de la guirlandes 
     */
    public void turnOn(){
        this.switch1.push();
    }
   
    /**
     * eteint les lampes de la guirlande 
     */
    public void turnOff(){
        this.switch1.push();
    }
    /**fait une description de la gurilande 
     * @return la description de la lampe 
     */
    public String toString(){
        String chaine = "Ce Guirlande contient "+Integer.toString(this.getNbLight())+" lampes et consomme "+Integer.toString(this.getConsumedPower())+" Watt";
        if (this.getStatut()){
            chaine =chaine + "\nAllumée";
        }
        else{
            chaine = chaine +"\nÉteint";
        }
        if (this.estHomogene()){
            chaine = chaine +"\n contient des couleurs uniques";
        }
        else{
            chaine = chaine +"\n contient differentes couleur ";
        }
        return chaine;
    }
     /**
     * methode equals pour deux guirlandes 
     * @return return true si deux ampoules  sont egales et false lme cas contraire 
     */
    public boolean equals (Object o){
        if (!(o instanceof LightString))
            return false;
        LightString other= (LightString) o;
        return this.nblight==other.nblight;
    }
    /**
     * cette methode retourrne false si tus es lampes de la guirlande ne sont pas de la meme couleur 
     * @return true ou false selon le guirlande es thomogene ou pas 
     */
    public boolean estHomogene (){
        int i =0;
        while ((i< this.lights.length-1) && (this.lights[i].getColor() ==this.lights[i+1].getColor())){
            i++;
        }
        return i ==this.lights.length -1;
    }
}