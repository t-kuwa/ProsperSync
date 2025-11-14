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
    it "有効な招待を承諾できること" do
      invitation = create(:account_invitation, account:, inviter: owner, email: invitee.email)

      expect do
        post "/api/v1/invitations/#{invitation.id}/accept", params: { token: invitation.token }, headers: auth_headers(invitee), as: :json
      end.to change(Membership, :count).by(1)

      expect(response).to have_http_status(:ok)
    end

    it "無効なトークンは拒否されること" do
      invitation = create(:account_invitation, account:, inviter: owner, email: invitee.email)

      post "/api/v1/invitations/#{invitation.id}/accept", params: { token: "invalid" }, headers: auth_headers(invitee), as: :json

      expect(response).to have_http_status(:unauthorized)
    end

    it "期限切れの招待は拒否されること" do
      invitation = create(:account_invitation, account:, inviter: owner, email: invitee.email, expires_at: 1.day.ago)

      post "/api/v1/invitations/#{invitation.id}/accept", params: { token: invitation.token }, headers: auth_headers(invitee), as: :json

      expect(response).to have_http_status(:unprocessable_content)
    end

    it "既存メンバーシップでは拒否されること" do
      invitation = create(:account_invitation, account:, inviter: owner, email: invitee.email)
      create(:membership, account:, user: invitee)

      post "/api/v1/invitations/#{invitation.id}/accept", params: { token: invitation.token }, headers: auth_headers(invitee), as: :json

      expect(response).to have_http_status(:unprocessable_content)
    end

    it "オーナーが他人の招待を受けると拒否されること" do
      invitation = create(:account_invitation, account:, inviter: owner, email: invitee.email)

      post "/api/v1/invitations/#{invitation.id}/accept", params: { token: invitation.token }, headers: auth_headers(owner), as: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "ユーザーのメールが招待と異なると拒否されること" do
      other_user = create(:user, email: "other@example.com")
      invitation = create(:account_invitation, account:, inviter: owner, email: invitee.email)

      post "/api/v1/invitations/#{invitation.id}/accept", params: { token: invitation.token }, headers: auth_headers(other_user), as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end
end
