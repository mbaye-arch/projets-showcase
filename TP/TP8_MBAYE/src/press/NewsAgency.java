package press;

import java.util.*;
import press.news.*;
import press.reader.*;

/**
 * A class to model new agency that send news to news reader
 */
public class NewsAgency {

   private List<NewsReader> readers;

   /**
    * build a news agency with no registered news reader
    */
   public NewsAgency() {
      this.readers = new ArrayList<>();
   }

   /**
    * register a new news reader
    * 
    * @param reader the news reader to register
    */
   public void registerReader(NewsReader reader) {
      this.readers.add(reader);
   }

   /**
    * returns the list of registered news reader
    * 
    * @return the list of registered news reader
    */
   public List<NewsReader> getReaders() {
      return this.readers;
   }

   /**
    * send a news to all registered news reader, they react using their receive()
    * method
    * 
    * @param news linfo a envoyer
    */
   public void sendNews(News news) {
      for (NewsReader reader : this.readers)
         reader.receive(news);
   }

}
