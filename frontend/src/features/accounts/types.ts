export type AccountType = "personal" | "team";

export type Account = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  accountType: AccountType;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
};

export type AccountSummary = Account & {
  owner?: {
    id: number;
    name: string;
    email: string;
  };
};

export type MembershipRole = "owner" | "member";

export type Membership = {
  id: number;
  accountId: number;
  userId: number;
  role: MembershipRole;
  invitedById: number | null;
  joinedAt: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
  };
};

export type CreateAccountPayload = {
  name: string;
  description?: string;
};

export type UpdateAccountPayload = {
  name?: string;
  description?: string | null;
};

export type CreateMemberPayload = {
  userId: number;
  role: MembershipRole;
};

export type UpdateMemberPayload = {
  role: MembershipRole;
};
