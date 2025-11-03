require "rails_helper"

RSpec.describe AccountInvitationPolicy, type: :policy do
  let(:account) { create(:account) }
  let!(:owner_membership) { create(:membership, :owner, account:) }
  let(:owner) { owner_membership.user }
  let(:member) { create(:membership, account:).user }
  let(:invitation) { create(:account_invitation, account:, inviter: owner, email: "invitee@example.com") }

  describe "index and create" do
    it "オーナーに許可すること" do
      policy = described_class.new(owner, invitation)
      expect(policy.index?).to be(true)
      expect(policy.create?).to be(true)
    end

    it "オーナーでないメンバーに禁止すること" do
      policy = described_class.new(member, invitation)
      expect(policy.index?).to be(false)
      expect(policy.create?).to be(false)
    end
  end

  describe "accept" do
    it "オーナーに承諾を許可すること" do
      expect(described_class.new(owner, invitation).accept?).to be(true)
    end

    it "メールアドレスが一致するユーザーに許可すること" do
      invitee = create(:user, email: invitation.email)
      expect(described_class.new(invitee, invitation).accept?).to be(true)
    end

    it "メールアドレスが一致しないユーザーに禁止すること" do
      invitee = create(:user, email: "other@example.com")
      expect(described_class.new(invitee, invitation).accept?).to be(false)
    end
  end
end
