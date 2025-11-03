require "rails_helper"

RSpec.describe Membership, type: :model do
  describe "validations" do
    subject(:membership) { build(:membership) }

    it "デフォルトの属性で有効であること" do
      expect(membership).to be_valid
    end

    it "ロールが必須であること" do
      allow(membership).to receive(:set_default_role)
      membership.role = nil
      expect(membership).to be_invalid
      expect(membership.errors[:role]).to include("can\'t be blank")
    end

    it "アカウント内でユーザーが一意であること" do
      existing_membership = create(:membership)
      membership = build(:membership, account: existing_membership.account, user: existing_membership.user)

      expect(membership).to be_invalid
      expect(membership.errors[:user_id]).to include("has already been taken")
    end
  end

  describe "defaults" do
    it "デフォルトでロールがmemberに設定されること" do
      membership = create(:membership, role: nil)

      expect(membership.role).to eq("member")
    end

    it "joined_atが自動的に設定されること" do
      membership = create(:membership)

      expect(membership.joined_at).to be_present
    end
  end

  describe "associations" do
    it "accountとuserに属していること" do
      membership = create(:membership)

      expect(membership.account).to be_a(Account)
      expect(membership.user).to be_a(User)
    end

    it "任意でinvited_byに属していること" do
      inviter = create(:user)
      membership = create(:membership, invited_by: inviter)

      expect(membership.invited_by).to eq(inviter)
    end
  end
end
