package press.reader;

import static org.junit.Assert.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.*;

import press.news.*;
public class BreakingNewsFeedTest {
    private BreakingNewsFeed breaker;
    private News news;
    private NewsReader reader;

    @BeforeEach
    public void before() {
        this.breaker = new BreakingNewsFeed("Abdoulaye");
        this.news = new News("title", "text", Status.BREAKING);
        this.reader = new SpecificNewsReader("Mbaye","text");

    }

    @Test
    public void testgetListeReader() {
        assertEquals(this.breaker.getListeReader().size(), 0);
        breaker.addReader(this.reader);
        assertEquals(this.breaker.getListeReader().size(), 1);
    }

    @Test
    public void testAddReader() {
        breaker.addReader(this.reader);
        assertTrue(this.breaker.getListeReader().contains(reader));
    }

    @Test
    public void testreceive() {
        breaker.addReader(this.reader);
        breaker.receive(this.news);
        assertEquals(this.reader.getNumberOfReceivedNews(), 1);
    }
}
