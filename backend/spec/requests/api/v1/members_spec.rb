require "rails_helper"

RSpec.describe "API::V1::Members", type: :request do
  let(:account) { create(:account) }
  let!(:owner_membership) { create(:membership, :owner, account:) }
  let!(:member_membership) { create(:membership, account:) }
  let(:owner) { owner_membership.user }
  let(:member) { member_membership.user }

  describe "GET /api/v1/accounts/:account_id/members" do
    it "オーナーは一覧取得できる" do
      get "/api/v1/accounts/#{account.id}/members", headers: auth_headers(owner), as: :json

      expect(response).to have_http_status(:ok)
      expect(parsed_body.size).to eq(account.memberships.count)
    end

    it "メンバーは一覧取得できる" do
      get "/api/v1/accounts/#{account.id}/members", headers: auth_headers(member), as: :json
      expect(response).to have_http_status(:ok)
    end

    it "外部ユーザーは拒否される" do
      get "/api/v1/accounts/#{account.id}/members", headers: auth_headers(create(:user)), as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/v1/accounts/:account_id/members" do
    let(:payload) { { member: { user_id: create(:user).id, role: :member } } }

    it "オーナーはメンバーを追加できる" do
      expect do
        post "/api/v1/accounts/#{account.id}/members", params: payload, headers: auth_headers(owner), as: :json
      end.to change { account.memberships.reload.count }.by(1)

      expect(response).to have_http_status(:created)
    end

    it "重複したメンバーシップは拒否される" do
      duplicate_payload = { member: { user_id: member.id, role: :member } }

      post "/api/v1/accounts/#{account.id}/members", params: duplicate_payload, headers: auth_headers(owner), as: :json

      expect(response).to have_http_status(:unprocessable_content)
    end

    it "オーナー以外は拒否される" do
      post "/api/v1/accounts/#{account.id}/members", params: payload, headers: auth_headers(member), as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "PATCH /api/v1/accounts/:account_id/members/:id" do
    it "オーナーはロールを変更できる" do
      patch "/api/v1/accounts/#{account.id}/members/#{member_membership.id}",
            params: { member: { role: :owner } },
            headers: auth_headers(owner),
            as: :json

      expect(response).to have_http_status(:ok)
      expect(member_membership.reload.role).to eq("owner")
    end

    it "メンバーは拒否される" do
      patch "/api/v1/accounts/#{account.id}/members/#{owner_membership.id}",
            params: { member: { role: :member } },
            headers: auth_headers(member),
            as: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "他のオーナー不在で自己降格すると422を返す" do
      patch "/api/v1/accounts/#{account.id}/members/#{owner_membership.id}",
            params: { member: { role: :member } },
            headers: auth_headers(owner),
            as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(parsed_body["errors"]).to include("オーナーは最低1名必要です。")
    end
  end

  describe "DELETE /api/v1/accounts/:account_id/members/:id" do
    it "オーナーはメンバーを削除できる" do
      expect do
        delete "/api/v1/accounts/#{account.id}/members/#{member_membership.id}", headers: auth_headers(owner), as: :json
      end.to change { account.memberships.reload.count }.by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "メンバーは退会できる" do
      expect do
        delete "/api/v1/accounts/#{account.id}/members/#{member_membership.id}", headers: auth_headers(member), as: :json
      end.to change { account.memberships.reload.count }.by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "オーナーのメンバーシップ削除は拒否される" do
      delete "/api/v1/accounts/#{account.id}/members/#{owner_membership.id}", headers: auth_headers(owner), as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end
end
