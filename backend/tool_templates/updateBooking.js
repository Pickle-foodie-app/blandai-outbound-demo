function updateBooking (qsp) {
    return {
    "name": "Update a customer booking",
    "description": "Use this tool to updates an existing customer's booking",
    "url": `https://hooks.zapier.com/hooks/catch/19187224/24jgde9/?id=${qsp}`,
    "method": "POST",
    "headers": {
        //"Authorization": apiKey, //Zapier webhook does not require authentication
        "Content-Type": "application/json"},
    "body": {
        "booking_id": "{{input.booking_id}}",
        "date": "{{input.date}}",
        "time": "{{input.time}}",
        "service": "{{input.service}}",
        "service_location": "{{input.service_location}}",
        "customer_mobile_number": "{{input.customer_mobile_number}}",
        "customer_name": "{{input.customer_name}}"
    },
    "input_schema": {
        /*"example": {
            "booking_id": 86491,
            "speech": "Got it - one second while I update your appointment for tomorrow to 10 AM.",
            "date": "2024-04-20",
            "time": "10:00 AM",
            "service": "Car Service",
            "service_location": "Preston",
            "customer_mobile_number": "0400123456",
            "customer_name": "Jess Sherger"
        },*/
        "type": "object",
        "properties": {
            "booking_id": "integer",
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
        "zap_updateBooking_webhook_execution": "$.status",
        "zap_updateBooking_webhook_receipt_id": "$.id"
    }};
  }

  module.exports = updateBooking;