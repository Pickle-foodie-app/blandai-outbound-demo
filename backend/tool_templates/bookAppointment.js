const bookAppointment = {
    "name": "Create a new customer booking",
    "description": "Tool to create a new customer booking",
    "url": "https://hooks.zapier.com/hooks/catch/19187224/24zlpmn/",
    "method": "POST",
    "headers": {
        //"Authorization": apiKey, //Zapier webhook does not require authentication
        "Content-Type": "application/json"},
    "body": {
        "date": "{{input.date}}",
        "time": "{{input.time}}",
        "service": "{{input.service}}",
        "service_location": "{{input.service_location}}",
        "customer_mobile_number": "{{input.customer_mobile_number}}",
        "customer_name": "{{input.customer_name}}",
    },
    "input_schema": {
        "example": {
            "speech": "Got it - one second while I book your appointment for tomorrow at 10 AM.",
            "date": "2024-04-20",
            "time": "10:00 AM",
            "service": "Car Service",
            "service_location": "Preston",
            "customer_mobile_number": "0400123456",
            "customer_name": "Jess Sherger"
        },
        "type": "object",
        "properties": {
            "speech": "string",
            "date": "YYYY-MM-DD",
            "time": "HH:MM AM/PM",
            "service": "Car Service, Car Repair, Logbook Service, or Other",
            "service_location": "string",
            "customer_mobile_number": "integer",
            "customer_name": "string"
        }
    },
    "response": {
        "succesfully_booked_slot": "$.status", //Previously it was < "$.success"
        "service_location": "$.service_location",
        "customer_mobile_number": "$.customer_mobile_number",
        "receipt_id": "$.id" // Attempted check to see if it fetches the zapier hook id
    }
  }

  module.exports = bookAppointment;