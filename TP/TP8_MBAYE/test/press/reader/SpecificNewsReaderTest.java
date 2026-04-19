package press.reader;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.*;
import press.news.*;

class SpecificNewsReaderTest {
    
    private SpecificNewsReader reader;

    @BeforeEach
    public void before() {
        this.reader = new SpecificNewsReader("Mbaye", "text");
    }

    @Test
    public void testGetMotCle() {
        assertEquals("text", reader.getMotCle());
    }

    @Test
    public void testContienMotCleWithMatchingNews() {
        News news = new News("title", "text",Status.NORMAL);
        assertTrue(reader.contienMotCle(news));
    }

    @Test
    public void testContienMotCleWithNonMatchingNews() {
        News news = new News("title", "abdou",Status.NORMAL);
        assertFalse(reader.contienMotCle(news));
    }

    @Test
    public void testReceiveAndPublish() {
        News news = new News("title", "text",Status.NORMAL);
        reader.receive(news);
        assertEquals(1, reader.numberOfReceivedNews);
    }
}
