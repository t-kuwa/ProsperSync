require "rails_helper"

RSpec.describe "API::V1::AccountInvitations", type: :request do
  let(:account) { create(:account) }
  let!(:owner_membership) { create(:membership, :owner, account:) }
  let(:owner) { owner_membership.user }
  let(:member) { create(:membership, account: account).user }
  let(:mailer_delivery) { instance_double(ActionMailer::MessageDelivery, deliver_later: true) }
  let(:mailer_instance) { instance_double(AccountInvitationMailer, invite_email: mailer_delivery) }

  before do
    allow(AccountInvitationMailer).to receive(:with).and_return(mailer_instance)
  end

  describe "GET /api/v1/accounts/:account_id/invitations" do
    it "allows owner" do
      get "/api/v1/accounts/#{account.id}/invitations", headers: auth_headers(owner), as: :json

      expect(response).to have_http_status(:ok)
    end

    it "forbids member" do
      get "/api/v1/accounts/#{account.id}/invitations", headers: auth_headers(member), as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/v1/accounts/:account_id/invitations" do
    let(:payload) { { invitation: { email: "invitee@example.com" } } }

    it "allows owner" do
      expect do
        post "/api/v1/accounts/#{account.id}/invitations", params: payload, headers: auth_headers(owner), as: :json
      end.to change(AccountInvitation, :count).by(1)

      expect(response).to have_http_status(:created)
    end

    it "fails with invalid data" do
      post "/api/v1/accounts/#{account.id}/invitations", params: { invitation: { email: "" } }, headers: auth_headers(owner), as: :json

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "forbids member" do
      post "/api/v1/accounts/#{account.id}/invitations", params: payload, headers: auth_headers(member), as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end
end
