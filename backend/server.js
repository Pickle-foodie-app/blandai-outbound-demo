require("dotenv").config();
const express = require("express");
const app = express();
const axios = require("axios");
const cors = require("cors");
const https = require("https");
const getAutomotiveMechanicsPrompt = require("./prompt_types/automotive_mechanics");
const getDomesticCleaningServicesPrompt = require("./prompt_types/domestic_cleaning_services");
const getTelephonyAIServiceEnquiryPrompt = require("./prompt_types/telephony_ai_service_enquiry");
const bookAppointment = require("./tool_templates/bookAppointment");
const updateBooking = require("./tool_templates/updateBooking");
const findBooking = require("./tool_templates/findBooking");
const setDynamicData = require("./dynamic_data/dynamicDataObject");
const ngrok = require("ngrok");


// Server setup
app.use(cors());
app.use(express.json());

// Grab the API key and set the port
const addressChangeEndPoint = process.env.ADDRESS_UPDATE_ZAP_ENDPOINT;
const apiKey = process.env.BLAND_API_KEY;
const PORT = process.env.PORT || 4000;
  
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Setup an Ngrok Web Address to forward webhooks to local port. It also automatically updates zapier with new transient address
let ngrokAddress;
ngrok.connect({ addr: 4000, authtoken_from_env: true })
    .then(listener => {console.log('Ngrok transient web address running on:', listener);

    ngrokAddress = listener;
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

// set context api endpoint name
const getContext = "/update-context"

// Handle form submissions
app.post("/request-demo", (req, res) => {
  // Data succesfully received from Frontend
  console.log("Received data:", req.body);

  // Setup session data identifier and objects
  let storageObjId = Math.random().toString(36).substring(2, 10);
  let storageObj = [{context_id: storageObjId}];
  objStorageArray.push(storageObj);
  console.log("Storage object ID:", storageObjId);

  // Parse the form values
  const { name, phoneNumber, companyName, businessType, useCase } = req.body;

// setup prompt template
  let prompt;
  if (businessType === "Automotive Mechanics") {
    prompt = getAutomotiveMechanicsPrompt(name, companyName, businessType, useCase);
  } else if (businessType === "Cleaning Services") {
    prompt = getDomesticCleaningServicesPrompt(name, companyName, businessType, useCase);
  } else {
    prompt = getTelephonyAIServiceEnquiryPrompt(name, companyName, businessType, useCase);
  };

// Set up tools
  let bookingTool = bookAppointment(storageObjId)
  let updateBookingTool = updateBooking(storageObjId)
  let findBookingTool = findBooking(storageObjId)

// Set up dynamic_data configuration for updating context mid call
  let dynamicApiEndPoint = `${ngrokAddress}${getContext}?id=${storageObjId}`;
  console.log("getContext API endpoint:", dynamicApiEndPoint);
  let updateContext = setDynamicData(dynamicApiEndPoint); 

  let newTransferPhoneNumber = "+61400878456"; // my secondary number as default Chirp AI customer support number
  let voiceId = "88831b36-7c85-4879-b6b0-22c2ff9f59d7" // This is a bland.ai public Australian Female voice called Lucy.
  let interruptionThreshold = 175


  // Set the prompt for the AI. Insert the form values directly into the prompt.
  const data = {
    phone_number: phoneNumber,
    task: prompt,
    tools: [updateBookingTool, bookingTool, findBookingTool],
    dynamic_data: [updateContext],
    reduce_latency: true,
    language: "en",
    voice: voiceId,
    transfer_phone_number: newTransferPhoneNumber,
    interruption_threshold: interruptionThreshold,
  };
console.log("dynamic_data:", data.dynamic_data);

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
  console.log("Received ingress webhook data:", req.body);

  // process webhook data here into session storage
  let context_id = req.body.context_id;
  let storage_array_id = objStorageArray.findIndex(array => array.length && array[0].context_id === context_id);

  if (storage_array_id !== -1) {
    objStorageArray[storage_array_id].push(req.body);
  } else {
    console.log(`"${context_id}" could not be found in storage. Context storage was not updated successfully.`)
  }

  res.status(200).send({ message: "Webhook received", status: "success"});
});



// API GET endpoint for dynamically passing data to blandAI agent during call.
app.get(getContext, (req, res) => {
  let qsp = req.query.id;

  let responseData = {
    newElements: [],
    newData: false
  };

  const noData = undefined;

// Prepare and send zap data from session storage array. 
  if (objStorageArray.length > 0 ) {

  let newContext = objStorageArray.find(array => array[0].context_id === qsp);
  console.log("newContext:", newContext);
  let cachedIndex = cachedObjData.findIndex(array => array.length && array[0].context_id === qsp);
  console.log("cachedIndex:", cachedIndex);
  let previousContext = cachedIndex !== -1 ? cachedObjData[cachedIndex] : [];
  console.log("previousContext:", previousContext);

  if (newContext !== undefined) {
  responseData.newData = newContext.length !== previousContext.length;
  console.log("NewContextLength:", newContext.length);
  console.log("previousContextLength:", previousContext.length);
  console.log("newData:", responseData.newData);

  if (responseData.newData) {
    responseData.newElements = newContext.slice(previousContext.length);
    console.log("responseData.newElements:", responseData.newElements);

    if (cachedIndex !== -1) {
      cachedObjData.splice(cachedIndex, 1);
    }
    let deepContextCopy = JSON.parse(JSON.stringify(newContext));
    cachedObjData.push(deepContextCopy);

  } else { res.status(200).send(noData);
    console.log("API response data: else statement 1");
    }  
  } else { res.status(200).send(noData);
    console.log("API response data: else statement 2");
    }
  
  if (newContext !== undefined && responseData.newData !== false) {
  res.status(200).send(responseData.newElements);
  console.log("API response data:", responseData.newElements);
    };

  } else { res.status(200).send(noData);
    console.log("API response data: else statement 3")
    }

  });

