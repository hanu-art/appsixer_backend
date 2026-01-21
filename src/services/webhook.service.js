import axios from "axios";  

import { config } from "../config/env.config.js";  
console.log(config.webhookUrl)
const sendNewContactWebhook = async (contact) => {
  try {
    if (!config.webhookUrl) return; // webhook configured nahi hai

    const payload = {
      text: `🔔 *New Contact Received*

*Name:* ${contact.name}
*Email:* ${contact.email}
*Phone:* ${contact.phone || 'N/A'}
*Message:* ${contact.message}
*Time:* ${contact.created_at}`,
    };

    await axios.post(config.webhookUrl, payload);
  } catch (error) {
 
    console.error('Slack webhook failed:', error.message);
  }
};

export { sendNewContactWebhook };