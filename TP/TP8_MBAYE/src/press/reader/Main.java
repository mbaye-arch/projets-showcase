package press.reader;


import press.date.Date;
import press.news.News;
import press.news.Status;

public class Main{
    public static void main(String[] args) {
        RecentSpecificNewsReader reader= new RecentSpecificNewsReader("ABDOU", "test", 1);
        News news = new News("test", "test", Status.NORMAL, Date.now());
        System.out.println(Date.now());
        reader.receive(news);
        System.out.println(reader.getNumberOfReceivedNews());
    }
}