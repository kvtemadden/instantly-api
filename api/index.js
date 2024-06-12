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
    return console.log(
      `Lead ${leadEmail} from campaign ${campaignId} has been deleted.`
    );
  } catch (error) {
    console.error(
      `Error deleting lead ${leadEmail} from campaign ${campaignId}:`,
      error
    );
  }
};

app.post("/", async (req, res) => {
  const event = req.body;

  console.log("Received event:", event);

  if (event.event_type === "campaign_completion") {
    const campaignId = event.campaign_id;
    const leadEmail = event.lead_email;

    if (campaignId && leadEmail) {
      await findAndDeleteLeadFromCampaign(campaignId, leadEmail)
        .then(() => res.status(200).send("Lead deleted from campaign.", res))
        .catch((err) =>
          res.status(500).send("Error deleting lead from campaign.")
        );
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
