package press.reader;

import org.junit.jupiter.api.*;

import press.news.News;

import static org.junit.jupiter.api.Assertions.*;
import press.news.Status;

public class NewsReaderTest {

    private NewsReader reader;
    private News news;

    @BeforeEach
    public void before() {
        this.reader = new NewsReader("Abdoulaye");
        this.news = new News("title", "text", Status.NORMAL);
    }

    @Test
    public void testGetName() {
        assertEquals("Abdoulaye", this.reader.getName());
    }

    @Test
    public void testgetNumberOfReceivedNews() {
        assertEquals(reader.getNumberOfReceivedNews(), 0);
    }

    @Test
    public void testreceive() {
        reader.receive(news);
        assertEquals(reader.getNumberOfReceivedNews(), 1);
    }
}
