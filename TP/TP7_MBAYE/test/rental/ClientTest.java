package rental;

import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

public class ClientTest {

	private Client c1;
	private Client c2;

    
	@BeforeEach
	public void before() {
		this.c1 = new Client("client1",20);
		this.c2 = new Client("client2",30);
	}

	@Test
	public void testGetName() {
		assertEquals("client1",this.c1.getName());
		assertEquals("client2",this.c2.getName());
	}

	@Test
	public void testGetAge() {
	    assertEquals(20,this.c1.getAge());
	    assertEquals(30,this.c2.getAge());
	}


}
