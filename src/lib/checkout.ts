import { fetchAuth, getApiBaseUrl, getAuthToken, type ApiEnvelope } from "./auth";

type DeliveryCostRequest = {
  origin_subdistrict_id: number;
  destination_subdistrict_id: number;
  weight: number;
  courier: string;
};

type DeliveryCostApiEnvelope = {
  status: boolean;
  message: string;
  data: unknown;
  error: string | null;
};

export type ShippingOption = {
  id: string;
  courier: string;
  courierName: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
};

export type CheckoutShippingPayload = {
  name: string;
  code: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
};

export type CheckoutItemPayload = {
  product_id: number;
  product_detail_id: number;
  product_unit_id: number;
  quantity: number;
};

export type CheckoutRequest = {
  user_address_id: number;
  user_id: string;
  payment_method_code: string;
  shipping: CheckoutShippingPayload;
  items: CheckoutItemPayload[];
};

type CheckoutResponse = ApiEnvelope<unknown> | null;

function parseShippingOptions(input: unknown, courier: string): ShippingOption[] {
  const source = Array.isArray(input)
    ? input
    : typeof input === "object" && input !== null
      ? [
          ...(Array.isArray((input as { costs?: unknown[] }).costs) ? (input as { costs: unknown[] }).costs : []),
          ...(Array.isArray((input as { results?: { costs?: unknown[] }[] }).results)
            ? (input as { results: { costs?: unknown[] }[] }).results.flatMap((result) => result.costs ?? [])
            : []),
        ]
      : [];

  return source.flatMap((item, index) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const candidate = item as {
      code?: unknown;
      name?: unknown;
      service?: unknown;
      description?: unknown;
      cost?: number | { value?: unknown; etd?: unknown }[] | { value?: unknown; etd?: unknown };
      value?: unknown;
      etd?: unknown;
    };

    const resolvedCourier =
      typeof candidate.code === "string" && candidate.code.trim().length > 0
        ? candidate.code
        : courier;
    const courierName =
      typeof candidate.name === "string" && candidate.name.trim().length > 0
        ? candidate.name
        : resolvedCourier.toUpperCase();
    const service = typeof candidate.service === "string" ? candidate.service : `${resolvedCourier.toUpperCase()} Service ${index + 1}`;
    const description = typeof candidate.description === "string" ? candidate.description : "Standard delivery";

    const pricingSource = Array.isArray(candidate.cost)
      ? candidate.cost[0]
      : candidate.cost && typeof candidate.cost === "object"
        ? candidate.cost
        : candidate;

    const cost = typeof candidate.cost === "number"
      ? candidate.cost
      : typeof pricingSource?.value === "number"
        ? pricingSource.value
        : Number(pricingSource?.value ?? 0);
    const etd = typeof pricingSource?.etd === "string" ? pricingSource.etd : String(pricingSource?.etd ?? "");

    if (!Number.isFinite(cost) || cost < 0) {
      return [];
    }

    return [{
      id: `${resolvedCourier}-${service}-${index}`,
      courier: resolvedCourier,
      courierName,
      service,
      description,
      cost,
      etd,
    }];
  });
}

export async function fetchDeliveryCost(request: DeliveryCostRequest) {
  const payload = await fetchAuth<unknown>("/auth/delivery-cost", {
    method: "POST",
    body: JSON.stringify(request),
  }) as DeliveryCostApiEnvelope;

  return parseShippingOptions(payload.data, request.courier);
}

export async function checkoutTransaction(request: CheckoutRequest) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token otentikasi tidak ditemukan. Silakan login kembali.");
  }

  const response = await fetch(`${getApiBaseUrl()}/transactions/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  const rawText = await response.text();
  let payload: CheckoutResponse = null;

  if (rawText) {
    try {
      payload = JSON.parse(rawText) as ApiEnvelope<unknown>;
    } catch {
      if (!response.ok) {
        throw new Error(rawText || "Checkout gagal diproses.");
      }

      return {
        status: true,
        message: "Checkout berhasil.",
        data: null,
        error: null,
      } satisfies ApiEnvelope<unknown>;
    }
  }

  if (!response.ok) {
    throw new Error(
      payload?.error || payload?.message || rawText || "Checkout gagal diproses."
    );
  }

  return (
    payload ?? {
      status: true,
      message: "Checkout berhasil.",
      data: null,
      error: null,
    }
  );
}
