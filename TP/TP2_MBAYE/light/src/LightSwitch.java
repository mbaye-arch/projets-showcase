/**LightSwitch la class interrupteurs 
 */
public class LightSwitch {
    private LightBulb light;
    /**constructeur de linterrupteur avec son attributs light
     * @param light de type LightBulb est la lampe de l'interrupteurs 
     */
    public LightSwitch(LightBulb light){
        this.light = light;
    }
    /**methode pour obtenir la lampe  
     * @return la lampe de l'interrupteurs 
    */
    public LightBulb getLightBulb(){
        return this.light;
    }
    /**methode push pour allumer et eteindre la lampe de l'interrupteur  
    */
    public void push(){
        if (this.light.getStatut()){
            this.light.turnOff();
        }
        else{
            this.light.turnOn();
        }
    }

}