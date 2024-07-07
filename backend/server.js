require("dotenv").config();
const express = require("express");
const app = express();
const axios = require("axios");
const cors = require("cors");
const https = require("https");
const getAutomotiveMechanicsPrompt = require("./prompt_types/automotive_mechanics")
const getDomesticCleaningServicesPrompt = require("./prompt_types/domestic_cleaning_services")
const getTelephonyAIServiceEnquiryPrompt = require("./prompt_types/telephony_ai_service_enquiry")

// Server setup
app.use(cors());
app.use(express.json());

// Grab the API key and set the port
const apiKey = process.env.BLAND_API_KEY;
const PORT = process.env.PORT || 4000;

// Handle form submissions
app.post("/request-demo", (req, res) => {
  // Data succesfully received from Frontend
  console.log("Received data:", req.body);

  // Parse the form values
  const { name, phoneNumber, companyName, businessType, useCase } = req.body;

  let prompt;
  if (businessType === "Automotive Mechanics") {
    prompt = getAutomotiveMechanicsPrompt(name, companyName, businessType, useCase);
  } else if (businessType === "Cleaning Services") {
    prompt = getDomesticCleaningServicesPrompt(name, companyName, businessType, useCase);
  } else {
    prompt = getTelephonyAIServiceEnquiryPrompt(name, companyName, businessType, useCase);
  };

  let newTransferPhoneNumber = "+61400878456"; // my secondary number as default Chirp AI customer support number
  let voiceId = "3a1e0243-ef27-4420-9b53-89f343eb49d4" // This is a private female aussie voice
  let interruptionThreshold = 175

  // Set the prompt for the AI. Insert the form values directly into the prompt.
  const data = {
    phone_number: phoneNumber,
    task: prompt,
    reduce_latency: false,
    transfer_phone_number: newTransferPhoneNumber,
    voice: voiceId,
    interruption_threshold: interruptionThreshold,
  };


  // create a http agent with the option to reject SSL cert validation due to issue i am encountering. 
  const httpAgent = new https.Agent({ rejectUnauthorized: false });
  
  // Dispatch the phone call
  axios
    .post("https://api.bland.ai/v1/calls", data, {
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
      httpsAgent: httpAgent,
    })
    .then((response) => {
      console.log("Response:", response.data);
      const { status } = response.data;

      if (status) {
        res
          .status(200)
          .send({ message: "Phone call dispatched", status: "success" });
      } else {
        res
          .status(400)
          .send({ message: "Error dispatching phone call", status: "error" });
      }
    })
    .catch((error) => {
      console.error("Error:", error);

      res
        .status(400)
        .send({ message: "Error dispatching phone call", status: "error" });
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
