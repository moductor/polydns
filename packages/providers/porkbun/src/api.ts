const baseUrl = new URL("https://api.porkbun.com/api/json/v3/");

export type Auth = {
  secretapikey: string;
  apikey: string;
};

export type DnsRecord = {
  id: string;
  name?: string;
  type: string;
  content: string;
  ttl?: string;
  prio?: string;
};

export async function makeRequest(
  path: string,
  auth: Auth,
  body: Record<string, any> = {}
) {
  const res = await fetch(new URL(path, baseUrl), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...auth,
      ...body,
    }),
  });

  const data = await res.json();
  if (res.status === 200) return data;
  throw new Error(JSON.stringify(data));
}

export async function getAllDomains(auth: Auth, wantedDomains?: string[]) {
  type Domain = { domain: string; notLocal: number };

  async function get(page: number = 0) {
    const res = await makeRequest("domain/listAll", auth, {
      start: page * 1000,
    });
    return res["domains"] as Domain[];
  }

  const domains: Domain[] = [];

  let res: Domain[];
  for (let page = 0; (res = await get(page)).length > 0; page++) {
    domains.push(...res);
    page++;
  }

  const data = domains.map((d) => ({
    domain: d.domain,
    isLocal: d.notLocal == 0,
  }));

  if (wantedDomains) {
    return data.filter((d) => wantedDomains.includes(d.domain));
  }

  return data;
}

export async function getNsForDomain(auth: Auth, domain: string) {
  const res = await makeRequest(`domain/getNs/${domain}`, auth);
  return res["ns"] as string[];
}

export async function getRecordsForDomain(auth: Auth, domain: string) {
  const res = await makeRequest(`dns/retrieve/${domain}`, auth);
  return res["records"] as DnsRecord[];
}

export async function getRecords(auth: Auth, domain: string) {
  async function getNs() {
    try {
      return await getNsForDomain(auth, domain);
    } catch {
      return [];
    }
  }

  const records = await getRecordsForDomain(auth, domain);
  const ns = await getNs();

  return records.filter((r) => r.type !== "NS" && !ns.includes(r.content));
}

export async function createRecord(
  auth: Auth,
  domain: string,
  record: Omit<DnsRecord, "id">
) {
  const res = await makeRequest(`dns/create/${domain}`, auth, record);
  return res;
}

export async function deleteRecord(
  auth: Auth,
  domain: string,
  record: Pick<DnsRecord, "id">
) {
  const res = await makeRequest(`dns/delete/${domain}/${record.id}`, auth);
  return res;
}
