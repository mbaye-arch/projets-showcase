package press.date;

import java.time.ZonedDateTime;
/**
 * cette classe represente la date 
 */
public class Date {

   private ZonedDateTime time;
   
   private Date() {
      this.time = ZonedDateTime.now();
   }

   /** tells if this date is older from another one by more than given number of minutes
    * @param other the date to compare with
    * @param minutes the number of considered minutes
    * @return true iff this time is older by more than minutes mn from other 
    */
   public boolean isOlderThan(Date other, int minutes) {
      return other.time.plusMinutes(minutes).isBefore(this.time);
   }
   
   /** a String representation for this Date
    * @return a String representation for this Date
    * @see java.lang.Object#toString()
    */
   public String toString() {
      return this.time.toString();
   }
   
   /** provides the current date (corresponding to the moment this method is called at) 
    * @return the current date 
    */
   public static Date now() {
      return new Date();
   }
}
