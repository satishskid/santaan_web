const BHASH_API_URL = "http://bhashsms.com/api/sendmsg.php";

type BaseWhatsAppPayload = {
  phone: string;
  imageUrl?: string;
};

type WhatsAppTemplateMessage = BaseWhatsAppPayload & {
  template: string;
  params?: string[];
};

type WhatsAppTextMessage = BaseWhatsAppPayload & {
  text: string;
};

const getBhashCredentials = () => {
  const user = process.env.BHASH_USER;
  const pass = process.env.BHASH_PASS;
  const sender = process.env.BHASH_SENDER || "BUZWAP";

  if (!user || !pass) {
    throw new Error("BHASH_USER/BHASH_PASS are required");
  }

  return { user, pass, sender };
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
  const { user, pass, sender } = getBhashCredentials();
  const finalPayload: Record<string, string> = {
    user,
    pass,
    sender,
    priority: "wa",
    stype: "normal",
    ...payload,
  };

  const fullUrl = `${BHASH_API_URL}?${new URLSearchParams(finalPayload).toString()}`;
  const response = await fetch(fullUrl);
  const result = await response.text();

  return {
    success: response.ok,
    status: response.status,
    result,
  };
};

// Backward-compatible API for existing routes.
export async function sendWhatsAppMessage(data: WhatsAppTemplateMessage) {
  try {
    const payload: Record<string, string> = {
      phone: normalizePhoneList(data.phone),
      text: data.template,
      htype: "normal",
    };

    if (data.params && data.params.length) {
      payload.Params = data.params.join(",");
    }

    if (data.imageUrl) {
      payload.htype = "image";
      payload.url = data.imageUrl;
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

export async function sendWhatsAppTextMessage(data: WhatsAppTextMessage) {
  try {
    const payload: Record<string, string> = {
      phone: normalizePhoneList(data.phone),
      text: data.text,
      htype: "normal",
    };

    if (data.imageUrl) {
      payload.htype = "image";
      payload.url = data.imageUrl;
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
