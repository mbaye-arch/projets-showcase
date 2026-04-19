package press.news;

import press.date.Date;

/**
 * model a news with title, text, date and priority status.
 */
public class News {

   private String title;
   private String text;
   private Date date;
   private Status status;
   
   /**
    * create a news with given data. The date of the news is the date of creation.
    * @param title the news title
    * @param text the news text
    * @param status the news status
    */
   public News(String title, String text, Status status) {
      this(title, text, status, Date.now());
   }

   /**
    * create a news with given data. 
    * @param title the news title
    * @param text the news text
    * @param status the news status
    * @param date the news date
    */
   public News(String title, String text, Status status, Date date) {
      this.title = title;
      this.text = text;
      this.status = status;
      this.date = date;
   }
   /**
    * returns the title of this news 
    * @return the title of this news 
    */   
    public String getTitle() {
      return this.title;
   }
   /**
    * returns the text of this news 
    * @return the text of this news 
    */   
   public String getText() {
      return this.text;
   }

   /**
    * returns the date of this news 
    * @return the date of this news 
    */   
   public Date getDate() {
      return this.date;
   }

   /**
    * returns the status of this news 
    * @return the status of this news 
    */   
   public Status getStatus() {
      return this.status;
   }
   public String toString() {
      return "("+this.status+") - "+ this.title+" : "+this.text; //+"("+this.date+")";
   }
}
