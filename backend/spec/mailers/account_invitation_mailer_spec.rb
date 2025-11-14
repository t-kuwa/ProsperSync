require "rails_helper"

RSpec.describe AccountInvitationMailer, type: :mailer do
  describe "#invite_email" do
    let(:invitation) { create(:account_invitation) }

    it "承諾URLに招待IDとトークンを含めること" do
      mail = described_class.with(invitation: invitation).invite_email

      expect(mail.to).to eq([invitation.email])
      expect(mail.body.encoded).to include("/invitations/#{invitation.id}/accept?token=#{invitation.token}")
    end
  end
end
