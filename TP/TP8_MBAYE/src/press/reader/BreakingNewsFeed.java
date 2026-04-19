package press.reader;

import java.util.ArrayList;
import java.util.List;
import press.news.*;

/**
 * cette classe represente BreakingNewsFeed
 * herite de la classe NewsReader
 */
public class BreakingNewsFeed extends NewsReader {
    /**
     * @param listeReader liste des lecteurs 
     */
    protected List<NewsReader> listeReader;

    /**
     * cette methode est le constructeur du BreakingNewsFeed
     * 
     * @param name et le nom du Reader
     */
    public BreakingNewsFeed(String name) {
        super(name);
        this.listeReader = new ArrayList<>();
    }

    /**
     * cette methode renvoie le liste des NewsReader a qui il publi les infos
     * 
     * @return array liste des NewsReader
     */
    public List<NewsReader> getListeReader() {
        return this.listeReader;
    }

    /**
     * cette methode ajoute un NewsReader dans la liste
     * 
     * @param reader reader a ajouter
     */
    public void addReader(NewsReader reader) {
        this.listeReader.add(reader);
    }

    /**
     * cette methode prend la liste des NewsReader et les partages les News ayant le
     * statut Breaking
     */
    @Override
    public void receive(News news) {
        if (news.getStatus() == Status.BREAKING) {
            for (NewsReader newsReader : this.listeReader) {
                newsReader.receive(news);
            }
        }
    }
}
