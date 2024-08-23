function setDynamicData (apiEndPoint) {
    return {
        "url": apiEndPoint,
        "method": "GET",
        "cache": false,
        "response_data": [
            {
                "name": "Mojo Dojo",
                "data": "Mojo Dojo is a data company", // This was a test to see if i could create static data here. (does not work)
                "context": "Mojo Dojo is a data company operated by JoJo"
            },
            {
                "name": "context id",
                "data": "$[0].context_id",
                "context": "Your context id is ${{context id}}"
            },
            { 
                "name": "new booking success",
                "data": "$[0].new_booking_success",
                "context": "Your new booking appointment was a ${{new booking success}}"
            },
            {
                "name": "Find a booking success",
                "data": "$[0].find_booking_success",
                "context": "Your find a booking appointment was ${{find a booking success}}"
            },
            {
                "name": "customer booking name",
                "data": "$[0].customer_name",
                "context": "Your customer booking name is ${{customer booking name}}"
            },
            {
                "name": "table record id",
                "data": "$[0].record_id",
                "context": "Your table record id is ${{table record id}}"
            },
            {
                "name": "retrieved booking service type",
                "data": "$[0].service_type",
                "context": "Your booked service type is ${{retrieved booking service type}}"
            },
            {
                "name": "retrieved booking location",
                "data": "$[0].service_location",
                "context": "Your booked service location is ${{retrieved booking location}}"
            },
            {
                "name": "booking updated status code",
                "data": "$[0].booking_update_code",
                "context": "Your booking update status code is ${{booking updated code}}"
            },
            {
                "name": "booking update id",
                "data": "$[0].booking_update_id",
                "context": "Your ID for your booking update is ${{booking update id}}"
            }
        ]
      };
}

module.exports = setDynamicData;