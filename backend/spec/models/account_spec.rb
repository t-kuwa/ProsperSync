require "rails_helper"

RSpec.describe Account, type: :model do
  describe "validations" do
    subject(:account) { build(:account) }

    it "is valid with default attributes" do
      expect(account).to be_valid
    end

    it "requires name" do
      account.name = nil
      expect(account).to be_invalid
      expect(account.errors[:name]).to include("can't be blank")
    end

    it "requires unique slug" do
      existing = create(:account, slug: "duplicate-slug")
      new_account = build(:account, slug: existing.slug)

      expect(new_account).to be_invalid
      expect(new_account.errors[:slug]).to include("has already been taken")
    end

    it "requires account_type" do
      account.account_type = nil
      expect(account).to be_invalid
      expect(account.errors[:account_type]).to include("can't be blank")
    end

    it "requires owner when personal" do
      personal = build(:account, :personal, owner: nil)
      expect(personal).to be_invalid
      expect(personal.errors[:owner]).to include("must exist")
    end
  end

  describe "callbacks" do
    it "assigns slug automatically" do
      account = build(:account, slug: nil)
      account.save!
      expect(account.slug).to be_present
    end

    it "prevents destroying personal account" do
      allow(Workspace::ProvisionPersonal).to receive(:call)
      account = create(:account, :personal)

      expect(account.destroy).to be_falsey
      expect(account.errors[:base]).to include("個人用ワークスペースは削除できません。")
      expect(Account.find_by(id: account.id)).to be_present
    end
  end

  describe "associations" do
    it "has memberships and users through memberships" do
      account = create(:account)
      membership = create(:membership, account:)

      expect(account.memberships).to include(membership)
      expect(account.users).to include(membership.user)
    end

    it "has account invitations" do
      account = create(:account)
      invitation = create(:account_invitation, account:)

      expect(account.account_invitations).to include(invitation)
    end
  end
end
