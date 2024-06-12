const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(bodyParser.json());

const findCompletedCampaignLeads = async (campaignId) => {
  const url = `https://api.instantly.ai/api/v1/unibox/emails?api_key=${process.env.API_KEY}&campaign_id=${campaignId}&preview_only=true&sent_emails=false&email_type=all&latest_of_thread=false`;
  const headers = {
    "Content-Type": "application/json",
  };

  console.log(`Fetching emails for campaign:`, campaignId);

  try {
    const response = await axios.get(url, { headers });
    console.log(`Response from Instantly API:`, response.data.data);
    return response.data.data.map(
      (emailData) => emailData.to_address_email_list
    );
  } catch (error) {
    console.error(`Error fetching emails:`, error);
    throw error;
  }
};

const getLeadStatus = async (campaignId, email) => {
  const url = `https://api.instantly.ai/api/v1/lead/get?api_key=${process.env.API_KEY}&campaign_id=${campaignId}&email=${email}`;
  const headers = {
    "Content-Type": "application/json",
  };

  console.log(`Fetching lead status for email:`, email);

  try {
    const response = await axios.get(url, { headers });
    return response.data[0].status;
  } catch (error) {
    console.error(`Error fetching lead status:`, error);
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
    console.log(`Response from Instantly API:`, response.data);
    console.log(
      `Leads ${leadEmails} from campaign ${campaignId} have been deleted.`
    );
    return response.data;
  } catch (error) {
    console.error(`Error deleting leads:`, error);
    throw error;
  }
};

app.post("/", async (req, res) => {
  const event = req.body;

  console.log("Received event:", event);

  if (event.event_type === "campaign_completed") {
    const campaignId = event.campaign_id;

    if (campaignId) {
      try {
        const leadEmails = await findCompletedCampaignLeads(campaignId);
        const validLeads = [];

        for (const email of leadEmails) {
          const status = await getLeadStatus(campaignId, email);
          if (status.toLowerCase() === "completed") {
            validLeads.push(email);
            console.log(`validLeads:`, validLeads);
          }
        }

        if (validLeads.length > 0) {
          await deleteLeadsFromCampaign(campaignId, validLeads);
          res.status(200).send("Leads deleted from campaign.");
        } else {
          res.status(200).send("No leads to delete.");
        }
      } catch (err) {
        res.status(500).send("Error deleting leads from campaign.");
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
