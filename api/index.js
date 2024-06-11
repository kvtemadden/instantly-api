const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(bodyParser.json());

// Mock function to find and delete a lead from a campaign
// You will need to implement this according to your actual lead management system
const findAndDeleteLeadFromCampaign = (campaignId, leadId) => {
  // Implement the logic to find and delete the lead from the campaign
  console.log(`Lead ${leadId} from campaign ${campaignId} has been deleted.`);
};

app.post("/", (req, res) => {
  const event = req.body;

  console.log("Received event:", event);

  if (event.type === "campaign_completion") {
    const campaignId = event.campaign_id;
    const leadId = event.lead_id;

    if (campaignId && leadId) {
      findAndDeleteLeadFromCampaign(campaignId, leadId);
      res.status(200).send("Lead deleted from campaign.");
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
