require "rails_helper"

RSpec.describe "API::V1::Invitations", type: :request do
  let(:account) { create(:account) }
  let!(:owner_membership) { create(:membership, :owner, account:) }
  let(:owner) { owner_membership.user }
  let(:invitee) { create(:user, email: "invitee@example.com") }
  let(:mailer_delivery) { instance_double(ActionMailer::MessageDelivery, deliver_later: true) }
  let(:mailer_instance) { instance_double(AccountInvitationMailer, invite_email: mailer_delivery) }

  before do
    allow(AccountInvitationMailer).to receive(:with).and_return(mailer_instance)
  end

  describe "POST /api/v1/invitations/:id/accept" do
    it "accepts valid invitation" do
      invitation = create(:account_invitation, account:, inviter: owner, email: invitee.email)

      expect do
        post "/api/v1/invitations/#{invitation.id}/accept", params: { token: invitation.token }, headers: auth_headers(invitee), as: :json
      end.to change(Membership, :count).by(1)

      expect(response).to have_http_status(:ok)
    end

    it "rejects invalid token" do
      invitation = create(:account_invitation, account:, inviter: owner, email: invitee.email)

      post "/api/v1/invitations/#{invitation.id}/accept", params: { token: "invalid" }, headers: auth_headers(invitee), as: :json

      expect(response).to have_http_status(:unauthorized)
    end

    it "rejects expired invitation" do
      invitation = create(:account_invitation, account:, inviter: owner, email: invitee.email, expires_at: 1.day.ago)

      post "/api/v1/invitations/#{invitation.id}/accept", params: { token: invitation.token }, headers: auth_headers(invitee), as: :json

      expect(response).to have_http_status(:unprocessable_content)
    end

    it "rejects duplicate membership" do
      invitation = create(:account_invitation, account:, inviter: owner, email: invitee.email)
      create(:membership, account:, user: invitee)

      post "/api/v1/invitations/#{invitation.id}/accept", params: { token: invitation.token }, headers: auth_headers(invitee), as: :json

      expect(response).to have_http_status(:unprocessable_content)
    end

    it "rejects when owner tries to accept invitation for someone else" do
      invitation = create(:account_invitation, account:, inviter: owner, email: invitee.email)

      post "/api/v1/invitations/#{invitation.id}/accept", params: { token: invitation.token }, headers: auth_headers(owner), as: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "rejects when user email does not match invitation email" do
      other_user = create(:user, email: "other@example.com")
      invitation = create(:account_invitation, account:, inviter: owner, email: invitee.email)

      post "/api/v1/invitations/#{invitation.id}/accept", params: { token: invitation.token }, headers: auth_headers(other_user), as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end
end
