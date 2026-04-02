const DEFAULT_BHASH_API_URL = "http://bhashsms.com/api/sendmsg.php";

type BaseWhatsAppPayload = {
  phone: string;
  imageUrl?: string;
};

type WhatsAppAttachment = {
  type: "document" | "image" | "video";
  url: string;
  fileName?: string;
};

type WhatsAppTemplateMessage = BaseWhatsAppPayload & {
  template: string;
  params?: string[];
  attachment?: WhatsAppAttachment;
};

type WhatsAppTextMessage = BaseWhatsAppPayload & {
  text: string;
};

const getBhashCredentials = () => {
  const user = process.env.BHASH_USER;
  const pass = process.env.BHASH_PASS;
  const sender = process.env.BHASH_SENDER || "BUZWAP";
  const apiUrl = process.env.BHASH_API_URL || DEFAULT_BHASH_API_URL;

  if (!user || !pass) {
    throw new Error("BHASH_USER/BHASH_PASS are required");
  }

  return { user, pass, sender, apiUrl };
};

const normalizePhoneList = (phone: string) => {
  return phone
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((value) => {
      let cleanPhone = value.replace(/\D/g, "");
      if (cleanPhone.length > 10 && cleanPhone.startsWith("91")) {
        cleanPhone = cleanPhone.substring(2);
      }
      return cleanPhone;
    })
    .filter(Boolean)
    .join(",");
};

const sendViaBhash = async (payload: Record<string, string>) => {
  const { user, pass, sender, apiUrl } = getBhashCredentials();
  const finalPayload: Record<string, string> = {
    user,
    pass,
    sender,
    priority: "wa",
    stype: "normal",
    ...payload,
  };

  const fullUrl = `${apiUrl}?${new URLSearchParams(finalPayload).toString()}`;
  const response = await fetch(fullUrl);
  const result = await response.text();

  return {
    success: response.ok,
    status: response.status,
    result,
  };
};

const applyAttachmentPayload = (payload: Record<string, string>, attachment?: WhatsAppAttachment) => {
  if (!attachment?.url) return;

  payload.htype = attachment.type;
  payload.url = attachment.url;

  if (attachment.type === "document" && attachment.fileName) {
    payload.fname = attachment.fileName;
  }
};

export async function sendBhashTemplateMessage(data: WhatsAppTemplateMessage) {
  const payload: Record<string, string> = {
    phone: normalizePhoneList(data.phone),
    text: data.template,
  };

  if (data.params?.length) {
    payload.Params = data.params.map((value) => String(value ?? "").trim()).join(",");
  }

  if (data.attachment) {
    applyAttachmentPayload(payload, data.attachment);
  } else if (data.imageUrl) {
    applyAttachmentPayload(payload, { type: "image", url: data.imageUrl });
  }

  return sendViaBhash(payload);
}

// Backward-compatible API for existing routes.
export async function sendWhatsAppMessage(data: WhatsAppTemplateMessage) {
  try {
    return await sendBhashTemplateMessage(data);
  } catch (error) {
    return {
      success: false,
      status: 500,
      result: String(error),
    };
  }
}

export async function sendWhatsAppTextMessage(data: WhatsAppTextMessage) {
  try {
    const payload: Record<string, string> = {
      phone: normalizePhoneList(data.phone),
      text: data.text,
    };

    if (data.imageUrl) {
      applyAttachmentPayload(payload, { type: "image", url: data.imageUrl });
    }

    return await sendViaBhash(payload);
  } catch (error) {
    return {
      success: false,
      status: 500,
      result: String(error),
    };
  }
}
