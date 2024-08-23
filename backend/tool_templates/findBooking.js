function findBooking (qsp) {
    return {
    "name": "Find an existing customer booking",
    "description": "use this tool to help a customer find an existing booking",
    "url": `https://hooks.zapier.com/hooks/catch/19187224/26gg4oi/?id=${qsp}`,
    "method": "POST",
    "headers": {
        //"Authorization": apiKey, //Zapier webhook does not require authentication
        "Content-Type": "application/json"},
    "body": {
        "booking_id": "{{input.booking_id}}"
    },
    "input_schema": {
        "example": {
            "speech": "Got it - one second while I book your appointment for tomorrow at 10 AM.",
            "booking_id": 68904
        },
        "type": "object",
        "properties": {
            "speech": "string",
            "booking_id": "integer"
        }
    },
    "response": {
        "zap_findBooking_webhook_execution": "$.status",
        "zap_findBooking_webhook_receipt_id": "$.id"
    }};
  }

  module.exports = findBooking;