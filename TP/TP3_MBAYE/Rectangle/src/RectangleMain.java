/**
 * programmes a faire pour tester 
 * on a fait les tester teslle quils sont demandes
 */
 public class RectangleMain {

    public static void usage() {
        System.out.println("Usage : java Rectangle <Longueur> <largeur> ,<Longueur only>");
        System.out.println("il faut que vous saisissiez la longueur et la largeur sinon seulement la longueur \net dans ce cas vous aurez un carrée");
        System.out.println("si vous inversez la longeur et la largeur ne vous inqietez pas vous aurez le rectangle \nque vous voulez");
        System.exit(0);
    }
    public static void main(String[] args) {
        if (args.length == 2){
            Rectangle rectangle1 = new Rectangle(Integer.parseInt(args[0]) ,Integer.parseInt(args[1]));
            Rectangle rectangle2 = new Rectangle(30, 20);
            System.out.println(rectangle1);
            System.out.println(rectangle2);
            System.out.println("la surface du rectangle1 est : "+rectangle1.getAire());
            if (rectangle1.estCarre()){
                System.out.println("rectangle1 est carrée");
            }
            else{
                System.out.println("rectangle1 n'est pas carrée");
            }
            System.out.println("la surface du rectangle1 est : "+rectangle2.getAire());
            if (rectangle2.estCarre()){
                System.out.println("rectangle2 est carrée");
            }
            else{
                System.out.println("rectangle2 n'est pas carrée");
            }
            if(rectangle1.equals(rectangle2)){
                System.out.println("ces deux rectangle sont egaux");
            }
            else{
                System.out.println("les deux rectangle ne sont pas egaux");
            }
        }
        else if (args.length ==1 ){
            Rectangle rectangle1 = new Rectangle(Integer.parseInt(args[0]) ,Integer.parseInt(args[0]));
            Rectangle rectangle2 = new Rectangle(30, 20);
            System.out.println(rectangle1);
            System.out.println(rectangle2);
            System.out.println("la surface du rectangle1 est : "+rectangle1.getAire());
            if (rectangle1.estCarre()){
                System.out.println("rectangle1 est carrée");
            }
            else{
                System.out.println("rectangle1 n'est pas carrée");
            }
            System.out.println("la surface du rectangle1 est : "+rectangle2.getAire());
            if (rectangle2.estCarre()){
                System.out.println("rectangle2 est carrée");
            }
            else{
                System.out.println("rectangle2 n'est pas carrée");
            }
            if(rectangle1.equals(rectangle2)){
                System.out.println("ces deux rectangle sont egaux");
            }
            else{
                System.out.println("les deux rectangle ne sont pas egaux");
            }
        }
        else{
            RectangleMain.usage();
        }
    }
}
