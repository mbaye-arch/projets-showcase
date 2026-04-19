package press.reader;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.*;
import press.news.News;
import press.news.Status;

public class RecentSpecificNewsReaderTest {

    private RecentSpecificNewsReader reader;
    private News news;
    private News news1;
    @BeforeEach
    public void before() {
        this.reader = new RecentSpecificNewsReader("Mbaye","text",0);
        this.news = new News("title", "text",Status.NORMAL);
        this.news1 = new News("k", "de", Status.NORMAL);
        }

    @Test
    public void testGetDureValidite() {
        assertEquals(0, reader.getDureValidite());
    }

    @Test
    public void testReceiveWithMotCle() {
        reader.receive(news);
        assertEquals(1, reader.getNumberOfReceivedNews());
    }

    @Test
    public void testReceiveWithoutMotCle() {
        reader.receive(news1);
        assertEquals(0, reader.getNumberOfReceivedNews());
    }
}
