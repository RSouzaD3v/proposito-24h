import Twilio from "twilio";

const client = Twilio(process.env.TWILIO_SID || "", process.env.TWILIO_AUTH || "");

export async function sendWaTwilio(toE164: string) {
  const from = `whatsapp:+14155238886`; // seu sender aprovado
  const to = `whatsapp:${toE164}`;
  const msg = await client.messages.create({ from, to, body: "Olá! Teste via Twilio WhatsApp." });
  console.log("Twilio SID:", msg.sid);
}
