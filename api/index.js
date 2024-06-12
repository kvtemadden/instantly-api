const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(bodyParser.json());

const findAndDeleteLeadFromCampaign = async (campaignId, leadEmail) => {
  const url = "https://api.instantly.ai/api/v1/lead/delete";
  const headers = {
    "Content-Type": "application/json",
  };
  const data = {
    api_key: process.env.API_KEY,
    campaign_id: campaignId,
    delete_all_from_company: false,
    delete_list: [leadEmail],
  };

  try {
    const response = await axios.post(url, data, { headers });
    console.log(`Response from Instantly API:`, response.data);
    console.log(
      `Lead ${leadEmail} from campaign ${campaignId} has been deleted.`
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(`Error response data:`, error.response.data);
      console.error(`Error response status:`, error.response.status);
      console.error(`Error response headers:`, error.response.headers);
    } else if (error.request) {
      console.error(`Error request:`, error.request);
    } else {
      console.error("Error", error.message);
    }
    console.error(`Error config:`, error.config);
    throw error;
  }
};

app.post("/", async (req, res) => {
  const event = req.body;

  console.log("Received event:", event);

  if (event.event_type === "campaign_completion") {
    const campaignId = event.campaign_id;
    const leadEmail = event.lead_email;

    if (campaignId && leadEmail) {
      try {
        const result = await findAndDeleteLeadFromCampaign(
          campaignId,
          leadEmail
        );
        res.status(200).send("Lead deleted from campaign.");
      } catch (err) {
        res.status(500).send("Error deleting lead from campaign.");
      }
    } else {
      res.status(400).send("Invalid event data.");
    }
  } else {
    res.status(200).send("Event not relevant.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
