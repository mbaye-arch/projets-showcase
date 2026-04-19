package util;

public class Modulo implements Operateur {
    @Override
    public int compute(int val1,int val2){
        return val1%val2;
    }
}
