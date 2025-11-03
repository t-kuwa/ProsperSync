require "rails_helper"

RSpec.describe AccountInvitation, type: :model do
let(:mailer_delivery) { instance_double(ActionMailer::MessageDelivery, deliver_later: true) }
let(:mailer_instance) { instance_double(AccountInvitationMailer, invite_email: mailer_delivery) }

before do
  allow(AccountInvitationMailer).to receive(:with).and_return(mailer_instance)
end

  describe "validations" do
    subject(:invitation) { build(:account_invitation) }

    it "is valid with default attributes" do
      expect(invitation).to be_valid
    end

    it "validates email format" do
      invitation.email = "invalid"
      expect(invitation).to be_invalid
      expect(invitation.errors[:email]).to include("is invalid")
    end

    it "validates role presence" do
      allow(invitation).to receive(:set_defaults)
      invitation.role = nil
      expect(invitation).to be_invalid
      expect(invitation.errors[:role]).to include("can't be blank")
    end

    it "enforces token uniqueness" do
      create(:account_invitation, token: "dup-token")
      invitation.token = "dup-token"

      expect(invitation).to be_invalid
      expect(invitation.errors[:token]).to include("has already been taken")
    end
  end

  describe "defaults" do
    it "sets token, role, and expires_at" do
      invitation = create(:account_invitation, token: nil, expires_at: nil, role: nil)

      expect(invitation.token).to be_present
      expect(invitation.role).to eq("member")
      expect(invitation.expires_at).to be_present
    end
  end

  describe "state helpers" do
    subject(:invitation) { build(:account_invitation) }

    it "detects expired invitations" do
      invitation.expires_at = 1.day.ago
      expect(invitation).to be_expired
    end

    it "detects revoked invitations" do
      invitation.revoked_at = Time.current
      expect(invitation).to be_revoked
    end

    it "detects acceptable invitations" do
      expect(invitation).to be_acceptable

      invitation.accepted_at = Time.current
      expect(invitation).not_to be_acceptable
    end
  end

  describe "#accept!" do
    let(:account) { create(:account) }
    let(:inviter) { account.owner }
    let(:invitee) { create(:user, email: "invitee@example.com") }

    it "creates membership and marks accepted_at" do
      invitation = create(:account_invitation, account:, inviter:, email: invitee.email)

      expect do
        invitation.accept!(invitee)
      end.to change(Membership, :count).by(1)

      expect(invitation.reload.accepted_at).to be_present
      membership = account.memberships.find_by(user: invitee)
      expect(membership).to be_member
      expect(membership.invited_by).to eq(inviter)
    end

    it "rejects mismatched email" do
      invitation = create(:account_invitation, account:, inviter:, email: "someone@example.com")

      expect { invitation.accept!(invitee) }.to raise_error(StandardError, /一致しません/)
    end

    it "rejects expired invitation" do
      invitation = create(:account_invitation, account:, inviter:, email: invitee.email, expires_at: 1.day.ago)

      expect { invitation.accept!(invitee) }.to raise_error(StandardError, /招待が無効/)
    end

    it "rejects duplicate membership" do
      invitation = create(:account_invitation, account:, inviter:, email: invitee.email)
      create(:membership, account:, user: invitee)

      expect { invitation.accept!(invitee) }.to raise_error(StandardError, /すでにメンバーです/)
    end
  end
end
