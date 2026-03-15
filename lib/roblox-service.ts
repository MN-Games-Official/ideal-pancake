export class RobloxService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getMembership(groupId: string, userId: string) {
    const filter = encodeURIComponent(`user=='users/${userId}'`);
    const url = `https://apis.roblox.com/cloud/v2/groups/${groupId}/memberships?maxPageSize=1&filter=${filter}`;
    
    const response = await fetch(url, {
      headers: { 'x-api-key': this.apiKey }
    });
    
    if (!response.ok) {
        throw new Error(`Failed to get membership: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.groupMemberships[0] || null;
  }

  async getRolesMap(groupId: string) {
    const response = await fetch(
      `https://groups.roblox.com/v1/groups/${groupId}/roles`
    );
    
    if (!response.ok) {
        throw new Error(`Failed to get roles: ${response.statusText}`);
    }
    
    const data = await response.json();
    const map: Record<number, number> = {};
    
    for (const role of data.roles) {
      map[role.rank] = role.id;
    }
    
    return map;
  }

  async promoteUser(
    groupId: string,
    membershipId: string,
    targetRank: number | string
  ) {
    let roleId: number;
    
    // Determine if targetRank is a rank string ("rank: 218"), a direct path ("groups/x/roles/y"), or direct ID
    if (typeof targetRank === 'string') {
        if (targetRank.startsWith('rank:')) {
            const rankNum = parseInt(targetRank.split(':')[1].trim());
            const rolesMap = await this.getRolesMap(groupId);
            roleId = rolesMap[rankNum];
            if (!roleId) throw new Error(`Rank ${rankNum} not found in group ${groupId}`);
        } else if (targetRank.includes('/roles/')) {
            roleId = parseInt(targetRank.split('/roles/')[1]);
        } else {
            roleId = parseInt(targetRank);
        }
    } else {
        const rolesMap = await this.getRolesMap(groupId);
        roleId = rolesMap[targetRank];
        if (!roleId) throw new Error(`Rank ${targetRank} not found in group ${groupId}`);
    }
    
    const url = `https://apis.roblox.com/cloud/v2/groups/${groupId}/memberships/${membershipId}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: `groups/${groupId}/roles/${roleId}`
      })
    });
    
    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Promotion failed: ${err.message || response.statusText}`);
    }
    
    return response.json();
  }
}
