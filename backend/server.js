require("dotenv").config();
const express = require("express");
const app = express();
const axios = require("axios");
const cors = require("cors");
const https = require("https");
const getAutomotiveMechanicsPrompt = require("./prompt_types/automotive_mechanics");
const getDomesticCleaningServicesPrompt = require("./prompt_types/domestic_cleaning_services");
const getTelephonyAIServiceEnquiryPrompt = require("./prompt_types/telephony_ai_service_enquiry");
const bookAppointmentTool = require("./tool_templates/bookAppointment");
const updateBookingTool = require("./tool_templates/updateBooking");
const ngrok = require("ngrok");


// Server setup
app.use(cors());
app.use(express.json());

// Grab the API key and set the port
const addressChangeEndPoint = process.env.ADDRESS_UPDATE_ZAP_ENDPOINT;
const apiKey = process.env.BLAND_API_KEY;
const PORT = process.env.PORT || 4000;
  
// Setup an Ngrok Web Address to forward webhooks to local port. It also automatically updates zapier with new transient address
ngrok.connect({ addr: 4000, authtoken_from_env: true })
    .then(listener => {console.log('Ngrok transient web address running on:', listener);

    const newAddressData = [{
      "newTransientWebAddress": listener,
      "webHookEndPoint": webhookEndpoint
    }];
    // Update this zap webhook address if you choose to point to a different account. 
    const zapHook = addressChangeEndPoint

    return axios.post(zapHook, newAddressData)
      .then(response => {
        console.log('New server instance - webhook address update response:', response.data);
      })
      .catch(err => {console.error('Webhook address update error message:', err);
      });
    })

    .catch(err => console.error('Ngrok error message:', err));

    

// Set in memory storage for the session
const objStorageArray = [];
const cachedObjData = [];

// Handle form submissions
app.post("/request-demo", (req, res) => {
  // Data succesfully received from Frontend
  console.log("Received data:", req.body);

  // Setup session data identifier and objects
  let storageObjId = Math.random().toString(36).substring(2, 10);
  let storageObj = [{context_id: storageObjId}];
  objStorageArray.push(storageObj);
  console.log("Storage object ID:", objStorageArray);


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
  let voiceId = "88831b36-7c85-4879-b6b0-22c2ff9f59d7" // This is a bland.ai public Australian Female voice called Lucy.
  let interruptionThreshold = 175


  // Set the prompt for the AI. Insert the form values directly into the prompt.
  const data = {
    phone_number: phoneNumber,
    task: prompt,
    tools: [updateBookingTool, bookAppointmentTool],
    dynamic_data: updateContext,
    reduce_latency: true,
    language: "en",
    voice: voiceId,
    transfer_phone_number: newTransferPhoneNumber,
    interruption_threshold: interruptionThreshold,
  };


  // create a http agent with the option to reject SSL cert validation due to issue i am encountering. 
  const httpAgent = new https.Agent({ rejectUnauthorized: false });
  
  console.log("Request Data:", data.tools);

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


// Webhook endpoint listener
const webhookEndpoint = "/agentchirplistener";
app.post(webhookEndpoint, (req, res) => {
  console.log("Received data:", req.body);

  // process webhook data here into session storage
  console.log(req.body);

  res.status(200).send({ message: "Webhook received", status: "success"});
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// API GET endpoint for dynamically passing data to blandAI agent during call.
app.get("/update-context", (req, res) => {
  let qsp = req.query.id;

  let responseData = {
    newElements: [],
    newData: false
  };

  const noData = undefined;

// Prepare and send zap data from session storage array. 
  if (objStorageArray.length > 0 ) {

  let newContext = objStorageArray.find(array => array[0].context_id === qsp);
  let cachedIndex = cachedObjData.findIndex(array => array.length && array[0].context_id === qsp);
  let previousContext = cachedIndex !== -1 ? cachedObjData[cachedIndex] : [];

  if (newContext !== undefined) {
  let newData = newContext.length !== previousContext.length;

  if (newData) {
    responseData.newElements = newContext.slice(previousContext.length);

    if (cachedIndex !== -1) {
      cachedObjData.splice(cachedIndex, 1);
    }
    cachedObjData.push(newContext);
  }
    else { res.status(200).send(noData);
    }  
  } else { res.status(200).send(noData);
    }

  if (newContext !== undefined) {
  res.status(200).send(responseData.newElements);
    };

  } else { res.status(200).send(noData);
    }

  });

