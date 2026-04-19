package press.news;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

public class NewsTest {

    @Test
    public void dataInitializationIsCorrect() {
        News news = new News("title", "text", Status.NORMAL);
        assertEquals("title", news.getTitle());
        assertEquals("text", news.getText());
        assertEquals(Status.NORMAL, news.getStatus());
    }
}
