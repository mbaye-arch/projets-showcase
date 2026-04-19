package press.reader;

import press.date.*;
import press.news.*;

/**
 * cette classe represente le RecentSpecificNewsReader
 * herite de la classe NewsReader
 */
public class RecentSpecificNewsReader extends SpecificNewsReader {
    
    protected int dureValidite;

    /**
     * constructeur de la classe RecentSpecificNewsReader
     * 
     * @param name         nom du lecteur
     * @param motCle     motCle utilise
     * @param dureValidite le temps de validite des news
     */
    public RecentSpecificNewsReader(String name, String motCle, int dureValidite) {
        super(name, motCle);
        this.dureValidite = dureValidite;
    }

    /**
     * cette methode eretourne la dureValidite
     * 
     * @return int minutes de validite
     */
    public int getDureValidite() {
        return this.dureValidite;
    }

    /**
     * cette methode permet la recetion d'un news sil est dans le temps de
     * validite du Reader
     */
    @Override
    public void receive(News news) {
        Date date = Date.now();
        if (date.isOlderThan(news.getDate(), this.getDureValidite())) {
            super.receive(news);
        }
    }
}
