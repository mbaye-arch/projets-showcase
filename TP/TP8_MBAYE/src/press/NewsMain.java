package press;

import press.news.*;
import press.reader.*;
/**
 * la classe de testes
 */
public class NewsMain {
    public static void main(String[] args) {

        NewsAgency agency = new NewsAgency();

        // après la Q1

        NewsReader plainReader1 = new NewsReader("plain1");
        agency.registerReader(plainReader1);

        // après la Q2
    
        NewsReader specificReader1 = new SpecificNewsReader("specific1", "java");
        agency.registerReader(specificReader1);

        // après la Q4

         BreakingNewsFeed breakingFeedReader = new BreakingNewsFeed("breaking");
         NewsReader plainReader2 = new NewsReader("plain2");
         NewsReader specificReader2 = new SpecificNewsReader("specific2", "timoleon");
         breakingFeedReader.addReader(plainReader2);
         breakingFeedReader.addReader(specificReader2);
         agency.registerReader(breakingFeedReader);
         

        agency.sendNews(new News("historique", "hello world", Status.NORMAL));
        agency.sendNews(new News("l'île de java", "venez visiter l'Indonésie", Status.NORMAL));
        agency.sendNews(new News("programmation", "timoleon programme en java", Status.BREAKING));
        agency.sendNews(new News("to do", "vous devez finir le TP", Status.URGENT));
    }
}
