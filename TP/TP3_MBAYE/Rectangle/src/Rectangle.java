/**
 * Classe Rectangle avec Longeuur et largeur 
 */
public class Rectangle{
    private double longueur;
    private double largeur;
    /**
     * constructeur de la classe rectangle la longeur et la largeur est necessaire 
     * dans le cas la largeur est plus grand que la longueur les valeurs sseront inverser 
     * @param longueur longeur du rectangle qui est superieur ou egale a largeur 
     * @param largeur  largeur du rectangle qui est inferieur ou egale a largeur 
     */
    public Rectangle(double longueur ,double largeur){
        if (longueur >=largeur){
            this.longueur=longueur;
            this.largeur = largeur;
        }
        else{
            this.longueur=largeur;
            this.largeur=longueur;
        }
    }
    /**
     * cette methode retourne la largeur du rectangle 
     * @return double la largeur du rectangle 
     */
    public double getLargeur(){
        return this.largeur;
    }
    /**
     * cette methode retourne la longueur du rectangle 
     * @return double la longueur du rectnagle 
     */
    public double getLongueur(){
        return this.longueur;
    }
    /**
     * cette methode donne l'aire du rectangle 
     * @return double l'aire du rectangle 
     */
    public double getAire(){
        return this.longueur * this.largeur;
    }
    /**
     * cette methode donne le permietre du rectangle 
     * @return double la perimetre du rectnagle 
     */
    public double getPerimetre(){
        return (this.longueur + this.largeur) *2;
    }
    /**
     * cette merhode retourn true si le rectangle est carre dans le cas contraire sa retourne false 
     * @return booelan true pour carre false autre cas 
     */
    public boolean estCarre(){
        return this.longueur==this.largeur;
    }
    /**
     * regarde si un rectangle est plus grand qu'un autre de par leur surface 
     * @param other Rectangle avec laquelle qu'on compare au rectangle 
     * @return boolean true si le rectangle est plus grand que l'autre et false dans le cas contraire 
     * s'ils sont egaux sa retourne true 
     */
    public boolean estPlusGrand(Rectangle other){
        return this.getAire() >= other.getAire();
    }
    /**
     * la methode equals qui compqre deux rectangle
     * @return retourne true si la longueur et la largeur des deux rectangles est egales et false dans le
     * cas contraire 
     */
    public boolean equals(Object o){
        if (!(o instanceof Rectangle))
            return false;
        Rectangle other = (Rectangle) o;
        return (this.longueur == other.longueur) && (this.largeur ==other.largeur);
    }
    /**
     * cette medthode fait une description de la lampe 
     * @return chaine de description 
     */
    public String toString(){
        String chaine = "Longueur : "+this.longueur+"\nLargeur : "+this.largeur+
        "\nSurface : "+this.getAire()+"\nPérimetre : "+this.getPerimetre();
        return chaine;
    }
    
}