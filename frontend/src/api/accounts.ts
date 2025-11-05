import { apiClient } from "./client";
import type {
  Account,
  AccountSummary,
  CreateAccountPayload,
  CreateMemberPayload,
  Membership,
  UpdateAccountPayload,
  UpdateMemberPayload,
} from "../features/accounts/types";

type ApiUser = {
  id: number;
  name: string;
  email: string;
};

type ApiAccount = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  account_type: "personal" | "team";
  owner_id: number;
  created_at: string;
  updated_at: string;
  owner?: ApiUser;
};

type ApiMembership = {
  id: number;
  account_id: number;
  user_id: number;
  role: "owner" | "member";
  invited_by_id: number | null;
  joined_at: string | null;
  user?: ApiUser;
};

const mapAccount = (account: ApiAccount): AccountSummary => ({
  id: account.id,
  name: account.name,
  slug: account.slug,
  description: account.description ?? null,
  accountType: account.account_type,
  ownerId: account.owner_id,
  createdAt: account.created_at,
  updatedAt: account.updated_at,
  owner: account.owner
    ? {
        id: account.owner.id,
        name: account.owner.name,
        email: account.owner.email,
      }
    : undefined,
});

const mapMembership = (membership: ApiMembership): Membership => ({
  id: membership.id,
  accountId: membership.account_id,
  userId: membership.user_id,
  role: membership.role,
  invitedById: membership.invited_by_id,
  joinedAt: membership.joined_at,
  user: membership.user
    ? {
        id: membership.user.id,
        name: membership.user.name,
        email: membership.user.email,
      }
    : undefined,
});

export const getAccounts = async (): Promise<AccountSummary[]> => {
  const { data } = await apiClient.get<ApiAccount[]>("/api/v1/accounts");
  return data.map(mapAccount);
};

export const getAccount = async (id: number): Promise<Account> => {
  const { data } = await apiClient.get<ApiAccount>(`/api/v1/accounts/${id}`);
  return mapAccount(data);
};

export const createAccount = async (
  payload: CreateAccountPayload,
): Promise<AccountSummary> => {
  const { data } = await apiClient.post<ApiAccount>("/api/v1/accounts", {
    account: {
      name: payload.name,
      description: payload.description,
    },
  });

  return mapAccount(data);
};

export const updateAccount = async (
  id: number,
  payload: UpdateAccountPayload,
): Promise<AccountSummary> => {
  const { data } = await apiClient.patch<ApiAccount>(
    `/api/v1/accounts/${id}`,
    {
      account: {
        name: payload.name,
        description: payload.description,
      },
    },
  );

  return mapAccount(data);
};

export const deleteAccount = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/v1/accounts/${id}`);
};

export const getMembers = async (
  accountId: number,
): Promise<Membership[]> => {
  const { data } = await apiClient.get<ApiMembership[]>(
    `/api/v1/accounts/${accountId}/members`,
  );
  return data.map(mapMembership);
};

export const createMember = async (
  accountId: number,
  payload: CreateMemberPayload,
): Promise<Membership> => {
  const { data } = await apiClient.post<ApiMembership>(
    `/api/v1/accounts/${accountId}/members`,
    {
      member: {
        user_id: payload.userId,
        role: payload.role,
      },
    },
  );

  return mapMembership(data);
};

export const updateMember = async (
  accountId: number,
  memberId: number,
  payload: UpdateMemberPayload,
): Promise<Membership> => {
  const { data } = await apiClient.patch<ApiMembership>(
    `/api/v1/accounts/${accountId}/members/${memberId}`,
    {
      member: {
        role: payload.role,
      },
    },
  );

  return mapMembership(data);
};

export const deleteMember = async (
  accountId: number,
  memberId: number,
): Promise<void> => {
  await apiClient.delete(`/api/v1/accounts/${accountId}/members/${memberId}`);
};
