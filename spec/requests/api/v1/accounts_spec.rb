require "rails_helper"

RSpec.describe "API::V1::Accounts", type: :request do
  let(:user) do
    allow(Workspace::ProvisionPersonal).to receive(:call)
    member = create(:membership)
    allow(Workspace::ProvisionPersonal).to receive(:call).and_call_original
    member.user
  end
  let(:headers) { auth_headers(user) }

  describe "GET /api/v1/accounts" do
    it "returns only accounts the user belongs to" do
      accessible = create(:account)
      create(:membership, account: accessible, user: user)
      create(:account) # inaccessible

      get "/api/v1/accounts", headers:, as: :json

      expect(response).to have_http_status(:ok)
      ids = parsed_body.map { |item| item["id"] }
      expect(ids).to contain_exactly(accessible.id)
    end
  end

  describe "GET /api/v1/accounts/:id" do
    it "allows members" do
      account = create(:account)
      create(:membership, account:, user: user)

      get "/api/v1/accounts/#{account.id}", headers:, as: :json

      expect(response).to have_http_status(:ok)
      expect(parsed_body["id"]).to eq(account.id)
    end

    it "forbids non-members" do
      account = create(:account)

      get "/api/v1/accounts/#{account.id}", headers:, as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/v1/accounts" do
    it "creates a team account" do
      payload = { account: { name: "新規チーム" } }

      expect do
        post "/api/v1/accounts", params: payload, headers:, as: :json
      end.to change(Account, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(parsed_body["name"]).to eq("新規チーム")
    end

    it "rejects personal account type" do
      payload = { account: { name: "個人", account_type: :personal } }

      post "/api/v1/accounts", params: payload, headers:, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "PATCH /api/v1/accounts/:id" do
    it "allows members" do
      account = create(:account)
      create(:membership, account:, user: user)

      patch "/api/v1/accounts/#{account.id}", params: { account: { name: "更新" } }, headers:, as: :json

      expect(response).to have_http_status(:ok)
      expect(account.reload.name).to eq("更新")
    end

    it "forbids non-members" do
      account = create(:account)

      patch "/api/v1/accounts/#{account.id}", params: { account: { name: "更新" } }, headers:, as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "DELETE /api/v1/accounts/:id" do
    it "allows owner to delete team account" do
      account = create(:account)
      membership = create(:membership, :owner, account:, user: user)

      expect do
        delete "/api/v1/accounts/#{account.id}", headers:, as: :json
      end.to change(Account, :count).by(-1)

      expect(response).to have_http_status(:no_content)
      expect(Membership.exists?(membership.id)).to be_falsey
    end

    it "rejects personal account deletion" do
      personal = create(:account, :personal, owner: user)
      create(:membership, :owner, account: personal, user: user)

      expect do
        delete "/api/v1/accounts/#{personal.id}", headers:, as: :json
      end.not_to change(Account, :count)

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "forbids non-owner members" do
      account = create(:account)
      create(:membership, account:, user: user)

      delete "/api/v1/accounts/#{account.id}", headers:, as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end
end
