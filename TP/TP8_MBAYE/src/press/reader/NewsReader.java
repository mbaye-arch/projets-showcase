package press.reader;

import press.news.*;

/**
 * cette classe represente un Reader
 */
public class NewsReader {
    /**
     * @param name nom du lecteur 
     */
    protected String name;
    /**
     * @param numberOfReceivedNews nombe new recu
     */
    protected int numberOfReceivedNews;

    /**
     * contructeur de la classe de NewsReader
     * qui prend en prend en parametre le nom
     * du lecteur et le nombre de news quil a recu a 0
     * @param name nom du lecteur 
     */
    public NewsReader(String name) {
        this.name = name;
        this.numberOfReceivedNews = 0;
    }

    /**
     * cette methode retourne le nom du lecteur
     * 
     * @return name nom du lecteur
     */
    public String getName() {
        return this.name;
    }

    /**
     * cette methode renvoie le nombre de news recu par le lecteur
     * 
     * @return int nombre de news recu par le lecteur
     */
    public int getNumberOfReceivedNews() {
        return this.numberOfReceivedNews;
    }

    /**
     * cette methode fait une descvriription du lecteur
     * 
     * @return String description du lecteur
     */
    @Override
    public String toString() {
        return this.name + " : " + this.numberOfReceivedNews;
    }

    /**
     * cette methode permet a un redear de recevoir un news ensuite dele pulier
     * 
     * @param news le news qu'il recois
     */
    public void receive(News news) {
        this.numberOfReceivedNews ++;
        this.publish(news);
    }

    /**
     * cette methode permet a un reader de publier un news
     * 
     * @param news le news a publier
     */
    protected void publish(News news) {
        System.out.println(this + "\t+ -> \t" + news);
    }

}
