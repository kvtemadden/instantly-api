const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(bodyParser.json());

const findLeadsInCampaign = async (campaignId) => {
  const url = `https://api.instantly.ai/api/v1/lead/get`;
  const headers = {
    "Content-Type": "application/json",
  };
  const params = {
    api_key: process.env.API_KEY,
    campaign_id: campaignId,
  };

  try {
    const response = await axios.get(url, { headers, params });
    console.log(`Response from Instantly API (leads):`, response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

const deleteLeadsFromCampaign = async (campaignId, leadEmails) => {
  const url = "https://api.instantly.ai/api/v1/lead/delete";
  const headers = {
    "Content-Type": "application/json",
  };
  const data = {
    api_key: process.env.API_KEY,
    campaign_id: campaignId,
    delete_all_from_company: false,
    delete_list: leadEmails,
  };

  try {
    const response = await axios.post(url, data, { headers });
    console.log(`Response from Instantly API (delete):`, response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

const handleAxiosError = (error) => {
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
};

app.post("/", async (req, res) => {
  const event = req.body;

  console.log("Received event:", event);

  if (event.event_type === "campaign_completed") {
    const campaignId = event.campaign_id;

    if (campaignId) {
      try {
        const leadsData = await findLeadsInCampaign(campaignId);
        const completedLeads = leadsData.leads
          .filter((lead) => lead.status === "completed")
          .map((lead) => lead.email);

        if (completedLeads.length > 0) {
          await deleteLeadsFromCampaign(campaignId, completedLeads);
          res.status(200).send("Operation successful.");
        } else {
          res.status(200).send("No leads to delete.");
        }
      } catch (err) {
        res.status(500).send("Operation failed.");
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
