require "rails_helper"

RSpec.describe "API::V1::Members", type: :request do
  let(:account) { create(:account) }
  let!(:owner_membership) { create(:membership, :owner, account:) }
  let!(:member_membership) { create(:membership, account:) }
  let(:owner) { owner_membership.user }
  let(:member) { member_membership.user }

  describe "GET /api/v1/accounts/:account_id/members" do
    it "allows owners" do
      get "/api/v1/accounts/#{account.id}/members", headers: auth_headers(owner), as: :json

      expect(response).to have_http_status(:ok)
      expect(parsed_body.size).to eq(account.memberships.count)
    end

    it "allows members" do
      get "/api/v1/accounts/#{account.id}/members", headers: auth_headers(member), as: :json
      expect(response).to have_http_status(:ok)
    end

    it "forbids outsiders" do
      get "/api/v1/accounts/#{account.id}/members", headers: auth_headers(create(:user)), as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/v1/accounts/:account_id/members" do
    let(:payload) { { member: { user_id: create(:user).id, role: :member } } }

    it "allows owners to add members" do
      expect do
        post "/api/v1/accounts/#{account.id}/members", params: payload, headers: auth_headers(owner), as: :json
      end.to change(Membership, :count).by(1)

      expect(response).to have_http_status(:created)
    end

    it "rejects duplicate memberships" do
      duplicate_payload = { member: { user_id: member.id, role: :member } }

      post "/api/v1/accounts/#{account.id}/members", params: duplicate_payload, headers: auth_headers(owner), as: :json

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "forbids non-owners" do
      post "/api/v1/accounts/#{account.id}/members", params: payload, headers: auth_headers(member), as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "PATCH /api/v1/accounts/:account_id/members/:id" do
    it "allows owner to change role" do
      patch "/api/v1/accounts/#{account.id}/members/#{member_membership.id}",
            params: { member: { role: :owner } },
            headers: auth_headers(owner),
            as: :json

      expect(response).to have_http_status(:ok)
      expect(member_membership.reload.role).to eq("owner")
    end

    it "forbids members" do
      patch "/api/v1/accounts/#{account.id}/members/#{owner_membership.id}",
            params: { member: { role: :member } },
            headers: auth_headers(member),
            as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "DELETE /api/v1/accounts/:account_id/members/:id" do
    it "allows owner to remove a member" do
      expect do
        delete "/api/v1/accounts/#{account.id}/members/#{member_membership.id}", headers: auth_headers(owner), as: :json
      end.to change(Membership, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "allows member to leave" do
      expect do
        delete "/api/v1/accounts/#{account.id}/members/#{member_membership.id}", headers: auth_headers(member), as: :json
      end.to change(Membership, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "forbids removing owner membership" do
      delete "/api/v1/accounts/#{account.id}/members/#{owner_membership.id}", headers: auth_headers(owner), as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end
end
