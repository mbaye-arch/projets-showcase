package press.reader;

import press.news.News;

/**
 * cette classe represente SpecificNewReader
 * herite de la classe NewsReader
 * 
 */
public class SpecificNewsReader extends NewsReader {
    protected String motCle;

    /**
     * constructeur de la class specific NewsReader
     * 
     * @param name   nom du ReaderSpecific
     * @param motCle le mot cle pour les infos a consulter ou recevoi
     */
    public SpecificNewsReader(String name, String motCle) {
        super(name);
        this.motCle = motCle;
    }

    /**
     * cette methode renvoie le mot cle du SpecificNewsReader
     * 
     * @return motCle le mot cle
     */
    public String getMotCle() {
        return this.motCle;
    }

    /**
     * cette methode regarde si le titre du news ou sont texte contient le mot cle
     * 
     * @param news le news a verifier
     * @return boolean true sil contient false sinon
     */
    public boolean contienMotCle(News news) {
        String title = (news.getTitle()).toUpperCase();
        String text = (news.getText()).toUpperCase();
        return title.contains(this.getMotCle().toUpperCase()) || text.contains(this.getMotCle().toUpperCase());
    }

    /**
     * cette methode recois et publie une information si il contien le motCle
     */
    @Override
    public void receive(News news) {
        if (this.contienMotCle(news)) {
            super.receive(news);
        }
    }

    /**
     * cette methode publie une information
     */
    @Override
    public void publish(News news) {
        System.out.println((this + "\t+ -> \t" + news).replaceAll(motCle, "_" + motCle.toUpperCase() + "_"));
    }

}
