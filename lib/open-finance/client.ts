/**
 * Open Finance client scaffolding — DataBank MVP
 *
 * Provê uma camada de abstração sobre provedores de Open Finance
 * (Pluggy / Belvo) para que a lógica de negócio seja agnóstica ao provedor.
 *
 * Para conectar um provedor real, defina as variáveis de ambiente:
 *   OPEN_FINANCE_PROVIDER=pluggy | belvo
 *   OPEN_FINANCE_CLIENT_ID=...
 *   OPEN_FINANCE_CLIENT_SECRET=...
 */

export type OpenFinanceProvider = "pluggy" | "belvo";

export interface ConnectTokenParams {
  userId: string;
  webhookUrl?: string;
}

export interface ConnectTokenResult {
  connectToken: string;
  expiresAt: Date;
}

export interface AccountData {
  externalId: string;
  institution: string;
  type: string;
  balance?: number;
  currency?: string;
}

// ─── Provider-specific response types ──────────────────────────────────────

interface PluggyConnectTokenResponse {
  accessToken: string;
  expiresAt: string;
}

interface PluggyAccount {
  id: string;
  bankData?: { transferNumber: string };
  type: string;
  balance: number;
  currencyCode: string;
}

interface PluggyAccountsResponse {
  results: PluggyAccount[];
}

interface BelvoConnectTokenResponse {
  access: string;
}

interface BelvoAccount {
  id: string;
  institution: { name: string };
  category: string;
  balance: { current: number };
  currency: string;
}

/**
 * Retorna o nome do provedor configurado ou lança erro se não configurado.
 */
export function getProvider(): OpenFinanceProvider {
  const provider = process.env.OPEN_FINANCE_PROVIDER as OpenFinanceProvider | undefined;
  if (!provider || !["pluggy", "belvo"].includes(provider)) {
    throw new Error("OPEN_FINANCE_PROVIDER não configurado. Defina como 'pluggy' ou 'belvo'.");
  }
  return provider;
}

/**
 * Gera um token de conexão temporário (connect token) para o widget
 * de Open Finance exibido ao usuário.
 *
 * Em produção, este método chama a API do provedor configurado.
 */
export async function createConnectToken(params: ConnectTokenParams): Promise<ConnectTokenResult> {
  const provider = getProvider();

  if (process.env.NODE_ENV === "development" || process.env.OPEN_FINANCE_MOCK === "true") {
    // Mock para desenvolvimento local sem credenciais reais
    return {
      connectToken: `mock-token-${provider}-${params.userId}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
    };
  }

  // Production: delegar ao cliente do provedor
  if (provider === "pluggy") {
    return createPluggyConnectToken(params);
  } else {
    return createBelvoConnectToken(params);
  }
}

/**
 * Busca os dados de contas de um item conectado.
 */
export async function fetchAccountData(externalId: string): Promise<AccountData[]> {
  const provider = getProvider();

  if (process.env.NODE_ENV === "development" || process.env.OPEN_FINANCE_MOCK === "true") {
    return [
      {
        externalId,
        institution: "Banco Mock S.A.",
        type: "BANK",
        balance: 1234.56,
        currency: "BRL",
      },
    ];
  }

  if (provider === "pluggy") {
    return fetchPluggyAccounts(externalId);
  } else {
    return fetchBelvoAccounts(externalId);
  }
}

// ─── Pluggy ────────────────────────────────────────────────────────────────

async function createPluggyConnectToken(params: ConnectTokenParams): Promise<ConnectTokenResult> {
  const baseUrl = "https://api.pluggy.ai";
  const apiKey = process.env.OPEN_FINANCE_CLIENT_SECRET;
  if (!apiKey) throw new Error("OPEN_FINANCE_CLIENT_SECRET não configurado para Pluggy");

  const res = await fetch(`${baseUrl}/connect_token`, {
    method: "POST",
    headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      clientUserId: params.userId,
      webhookUrl: params.webhookUrl,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pluggy connect token error: ${err}`);
  }

  const data = (await res.json()) as PluggyConnectTokenResponse;
  return { connectToken: data.accessToken, expiresAt: new Date(data.expiresAt) };
}

async function fetchPluggyAccounts(itemId: string): Promise<AccountData[]> {
  const baseUrl = "https://api.pluggy.ai";
  const apiKey = process.env.OPEN_FINANCE_CLIENT_SECRET;
  if (!apiKey) throw new Error("OPEN_FINANCE_CLIENT_SECRET não configurado para Pluggy");

  const res = await fetch(`${baseUrl}/accounts?itemId=${itemId}`, {
    headers: { "X-API-KEY": apiKey },
  });

  if (!res.ok) throw new Error(`Pluggy accounts error: ${res.statusText}`);

  const data = (await res.json()) as PluggyAccountsResponse;
  return data.results.map((a) => ({
    externalId: a.id,
    institution: a.bankData?.transferNumber ?? "Desconhecida",
    type: a.type,
    balance: a.balance,
    currency: a.currencyCode,
  }));
}

// ─── Belvo ─────────────────────────────────────────────────────────────────

async function createBelvoConnectToken(params: ConnectTokenParams): Promise<ConnectTokenResult> {
  const secretId = process.env.OPEN_FINANCE_CLIENT_ID;
  const secretPassword = process.env.OPEN_FINANCE_CLIENT_SECRET;
  if (!secretId || !secretPassword)
    throw new Error("OPEN_FINANCE_CLIENT_ID / SECRET não configurado para Belvo");

  const res = await fetch("https://sandbox.belvo.com/api/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${secretId}:${secretPassword}`).toString("base64")}`,
    },
    body: JSON.stringify({
      scopes: "read_institutions,read_accounts,read_transactions",
      widget: { callback_urls: { success: params.webhookUrl ?? "" } },
    }),
  });

  if (!res.ok) throw new Error(`Belvo connect token error: ${res.statusText}`);

  const data = (await res.json()) as BelvoConnectTokenResponse;
  return {
    connectToken: data.access,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
}

async function fetchBelvoAccounts(linkId: string): Promise<AccountData[]> {
  const secretId = process.env.OPEN_FINANCE_CLIENT_ID;
  const secretPassword = process.env.OPEN_FINANCE_CLIENT_SECRET;
  if (!secretId || !secretPassword)
    throw new Error("OPEN_FINANCE_CLIENT_ID / SECRET não configurado para Belvo");

  const res = await fetch(`https://sandbox.belvo.com/api/accounts/?link=${linkId}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${secretId}:${secretPassword}`).toString("base64")}`,
    },
  });

  if (!res.ok) throw new Error(`Belvo accounts error: ${res.statusText}`);

  const data = (await res.json()) as BelvoAccount[];
  return data.map((a) => ({
    externalId: a.id,
    institution: a.institution.name,
    type: a.category,
    balance: a.balance.current,
    currency: a.currency,
  }));
}
