
#define MIN_ANGLE 20
#define MAX_ANGLE 150
#define SERVO_PIN 9
int buzzer = 37;
int led_green = 22;

int temp = 1;
int first_time_hours;
int first_time_minutes;

int second_time_hours;
int second_time_minutes;

int third_time_hours;
int third_time_minutes;

int fourth_time_hours;
int fourth_time_minutes;

int fed_in_minute;

#include <Servo.h>
#include <Wire.h>
#include <RtcDS3231.h>
#include <ArduinoJson.h>

Servo myservo; 
RtcDS3231<TwoWire> Rtc(Wire);




void setup () 
{
  fed_in_minute = -1;
  first_time_hours = -1;
  first_time_minutes= -1;
  
  second_time_hours= -1;
  second_time_minutes= -1;
  
  third_time_hours= -1;
  third_time_minutes= -1;
  
  fourth_time_hours= -1;
  fourth_time_minutes= -1;
  Serial.begin(9600);
  Serial1.begin(57600);


  Serial1.print(__DATE__);
  Serial1.println(__TIME__);
  Rtc.Begin();

  pinMode(buzzer, OUTPUT);
  pinMode(led_green, OUTPUT);


  
  digitalWrite(led_green, LOW);

  
  RtcDateTime compiled = RtcDateTime(__DATE__, __TIME__);
  printDateTime(compiled);
  Serial1.println();



  if (!Rtc.IsDateTimeValid()) 
  {if (Rtc.LastError() != 0)
      {Serial1.print("RTC communications error = ");
       Serial1.println(Rtc.LastError());}else
      {Serial1.println("RTC lost confidence in the DateTime!");
          Rtc.SetDateTime(compiled);}}
  if (!Rtc.GetIsRunning())
  {Serial1.println("RTC was not actively running, starting now");
   Rtc.SetIsRunning(true);}
  RtcDateTime now = Rtc.GetDateTime();
  if (now < compiled) 
  {Serial1.println("RTC is older than compile time!  (Updating DateTime)");
   Rtc.SetDateTime(compiled);}else if (now > compiled) 
  {Serial1.println("RTC is newer than compile time. (this is expected)");}else if (now == compiled) 
  {Serial1.println("RTC is the same as compile time! (not expected but all is fine)");}
  Rtc.Enable32kHzPin(false);
  Rtc.SetSquareWavePin(DS3231SquareWavePin_ModeNone); 
}

void loop () 
{ 
  
  if(Serial.available()>0)
  {
    String inBytes = Serial.readStringUntil('\n');
    if (inBytes == "feed_now")
    {
      feed();
    }
    if (inBytes == "discard_meals")
    {
      fed_in_minute = -1;
      first_time_hours = -1;
      first_time_minutes= -1;
  
      second_time_hours= -1;
      second_time_minutes= -1;
  
      third_time_hours= -1;
      third_time_minutes= -1;
  
      fourth_time_hours= -1;
      fourth_time_minutes= -1;
    }
    else{
      StaticJsonDocument<80> doc;
      DeserializationError error =  deserializeJson(doc, inBytes);
      if(error){
        Serial1.print("deserializeJson() failed with code");
        Serial1.println(error.c_str());
        }
        first_time_hours = doc["1"][0];
        first_time_minutes = doc["1"][1];
        
        second_time_hours = doc["2"][0];
        second_time_minutes = doc["2"][1];

        third_time_hours = doc["3"][0];
        third_time_minutes = doc["3"][1];

        fourth_time_hours = doc["4"][0];
        fourth_time_minutes = doc["4"][1];

        delay(1000);
      }
    }





    
    if (!Rtc.IsDateTimeValid()) 
    { 
    if (Rtc.LastError() != 0)
    { Serial1.print("RTC communications error = ");
      Serial1.println(Rtc.LastError());}else
    {Serial1.println("RTC lost confidence in the DateTime!");}
    }
    RtcDateTime now = Rtc.GetDateTime();
    printDateTime(now);
    Serial1.println();
    if (first_time_hours != -1){ 
      if ((fed_in_minute + temp) == now.Minute())
        {
          fed_in_minute = -1;
        }
      if((now.Hour()== first_time_hours && now.Minute()== first_time_minutes) || 
          (now.Hour()== second_time_hours && now.Minute()== second_time_minutes) ||
          (now.Hour()== third_time_hours && now.Minute()== third_time_minutes)||
          (now.Hour()== fourth_time_hours && now.Minute()== fourth_time_minutes)){
             if(fed_in_minute != now.Minute()){  
                feed();
                fed_in_minute = now.Minute();
         }
            
                }
    }
    delay(5000);
}

#define countof(a) (sizeof(a) / sizeof(a[0]))

void beep()
{
  tone(buzzer, 50); 
  delay(500);        
  noTone(buzzer);     
  delay(500);
}

void feed(){
      digitalWrite(led_green, HIGH);
      myservo.attach(SERVO_PIN);
      myservo.write(MIN_ANGLE);
      delay(2000);
      myservo.write(MAX_ANGLE);
      delay(2000);
      myservo.detach();
      beep();
      digitalWrite(led_green, LOW);
      Serial.write("pet_fed");
}

void printDateTime(const RtcDateTime& dt)
{
    char datestring[20];

    snprintf_P(datestring, 
            countof(datestring),
            PSTR("%02u/%02u/%04u %02u:%02u:%02u"),
            dt.Month(),
            dt.Day(),
            dt.Year(),
            dt.Hour(),
            dt.Minute(),
            dt.Second() );
    Serial1.print(datestring);
}
