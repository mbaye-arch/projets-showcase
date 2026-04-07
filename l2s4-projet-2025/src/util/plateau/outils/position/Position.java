package util.plateau.outils.position;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
/**
 * cette classe est la classe position qui va nous permettre de travailler sur le plateau de maniere plus simple
 */
public class Position {
    /**
     * coordone x de la position
     */
    protected int x;
    /**
     * coordone y de la position
     */
    protected int y;
    /**
     * contructeur de la classe  Position
     * @param x coordone x sur les ligne
     * @param y coordone y sur les colonnes
     */
    public Position(int x, int y){
        this.x = x;
        this.y = y;
    }
    /** 
     * X getter
    *@return x coordonne x 
    */
    public int getX() {
        return this.x;
    }    
    /**
     * X setter
     * @param x le coordonne a mettre dans la position
     */
    public void setX(int x) {
        this.x = x;
    }
    /**
     * Y getter 
     * @return Y coordonne y 
     */
    public int getY() {
        return this.y;
    }

     /**
     * Y setter
     * @param y le coordonne a mettre dans la position
     */
    public void setY(int y) {
        this.y = y;
    }

    /**verifie si deux position sont égales
     *@param o l'onjet a verifier
     *@return true if two position are the same
     */
    @Override
    public boolean equals(Object o){
        if (!(o instanceof Position)){
            return false;
        }
        else{
            Position other = (Position) o;
            return this.x==other.x && this.y==other.y;
        }
    }
    /**
     * cette methode permet la representation d'une position
     * @return String la representation
     */
    @Override
    public String toString(){
        return "("+this.x+","+this.y+")";
    }


    /**
     * Retourne une position suivant la direction 
     * @param direction une direction parmis les 4 points cardinaux
     * @return new Position la position qui suit 
     */
    public Position nextPosition(Direction direction){
        return new Position(this.getX()+direction.getX(),this.getY()+direction.getY());
    }
    /**
     * Retourn true si une position est valide dans le tableau 
     * cela es fait pour eviter de prendre des position qui sont hors de la case 
     * @param ligne pour eviter debordement
     * @param colonne pour eviter debordement
     * @return boolean true ou false 
     */
    public boolean isValide (int ligne,int colonne){
        return (this.getX() >= 0 && this.getX() < ligne) && (this.getY() >= 0 && this.getY() < colonne);
    }

    /**
     * Retourn les 4 position voisins dans les 4 poinst cardinaux  
     * @param ligne nombre de ligne pour eviter debordement 
     * @param colonne nombre de ligne pour eviter debordement
     * @return List(Position) retune une liste de position qui sont voisins et valide
     */
    public List<Position> getPositionVoisin(int ligne,int colonne){
        List<Position> res = new ArrayList<>();
        for (Direction dir : Direction.values()) {
            Position posNew= this.nextPosition(dir);
            if(posNew.isValide(ligne,colonne)){
                res.add(posNew);
            }
        }
        return res;
    }
    /**
     * Retourne une cote aleatoire selon un positione donnes  
     * @param ligne nombre de ligne pour eviter debordement 
     * @param colonne nombre de ligne pour eviter debordement
     * @return Position renvoie une ouvelle position 
     */
    public Position getCoteAlea(int ligne,int colonne){
        List<Position> positionCote=this.getPositionVoisin(ligne,colonne);
        Random alea = new Random();
        return positionCote.get(alea.nextInt(positionCote.size()));
    }

    /**
     * cette methode renvoie true si deux positions sont proches 
     * @param other lautre position a comparer
     * @return Boolean true ou false
     */
    public boolean sontProches(Position other){
        int x = this.getX()-other.getX();
        int y = this.getY()-other.getY();
        return  (x==0 && Position.abs(y)==1)||(y==0 && Position.abs(x)==1);
    }

    /**
     * cette methode retourne la valeur absolue d'un nombre 
     * @param val la valeur dont on veux la valeur absolue 
     * @return int la valeur absolue 
     */
    public static int abs(int val){
        if (val<0){
            return val*-1;
        }
        return val;
    }

    /**
     * cette methode retourne les psitions voisins d'une position donnee y compris les 
     * diagonales
     * @param ligne
     * @param colonne
     * @return
     */
    public List<Position> getPositionVoisins(int ligne,int colonne){
        Position[] res = {new Position(this.getX()-1,this.getY()),new Position(this.getX()+1,this.getY()),new Position(this.getX(),this.getY()-1),new Position(this.getX(),this.getY()+1)};
        List<Position> resList = new ArrayList<>();
        for (Position position : res) {
            if (position.isValide(ligne, colonne)){
                resList.add(position);
            }
        }
        return resList;
    }
}
