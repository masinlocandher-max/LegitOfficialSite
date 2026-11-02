// Suggestions, not an availability or pricing catalog. Senz owns commercial offers.
export const QUOTE_URL = "https://www.senzpr.com/legit-official-site/";
export const ADDONS = Object.freeze({
  booking: {
    name: "Appointment tools",
    product: "SENZ Booking",
    text: "Request a separate appointment tool for service times and customer requests. Activation and availability are confirmed by SENZ.",
    limit:
      "The current booking engine does not take deposits or send reminders.",
  },
  reservation: {
    name: "Reservation tools",
    product: "Scoped reservation setup",
    text: "Ask SENZ to scope the reservation flow your venue or stay requires.",
    limit:
      "Overnight availability, room inventory, and deposits need a separate verified integration.",
  },
  ordering: {
    name: "Ordering & checkout",
    product: "Scoped ordering setup",
    text: "Connect an existing ordering destination, or ask SENZ to scope an ordering system for your business.",
    limit:
      "QR Menu and Digital Catalog do not process orders or payments. Checkout requires a separately verified service.",
  },
  "event-systems": {
    name: "Event registration",
    product: "SENZ Event Systems",
    text: "Request a separate registration tool for attendee requests, capacity, and check-in.",
    limit: "The current event engine does not sell tickets.",
  },
  "digital-catalog": {
    name: "Product inquiry catalog",
    product: "SENZ Digital Catalog",
    text: "Request a separate searchable catalog and product inquiry lists.",
    limit: "A catalog inquiry is not a confirmed order or payment.",
  },
  "qr-menu": {
    name: "Digital menu",
    product: "SENZ QR Menu",
    text: "Request a separate menu with a QR code and editable menu items.",
    limit: "The current menu does not take orders or payments.",
  },
  crm: {
    name: "Customer follow-up",
    product: "SENZ CRM",
    text: "Request a separate tool to organize contacts, stages, and follow-ups.",
    limit: "The current CRM does not send messages automatically.",
  },
});
export function suggestionsFor(template) {
  const primary =
    template.tool || (template.id === "forma" ? "digital-catalog" : "crm");
  const ids = [
    primary,
    ...(template.id === "table"
      ? ["qr-menu", "digital-catalog"]
      : primary === "crm"
        ? ["booking"]
        : ["crm"]),
  ];
  return [...new Set(ids)].map((id) => ({ id, ...ADDONS[id] }));
}
