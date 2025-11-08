require "rails_helper"

RSpec.describe Account, type: :model do
  describe "validations" do
    subject(:account) { build(:account) }

    it "デフォルトの属性で有効であること" do
      expect(account).to be_valid
    end

    it "名前が必須であること" do
      account.name = nil
      expect(account).to be_invalid
      expect(account.errors[:name]).to include("can't be blank")
    end

    it "スラッグが一意であること" do
      existing = create(:account, slug: "duplicate-slug")
      new_account = build(:account, slug: existing.slug)

      expect(new_account).to be_invalid
      expect(new_account.errors[:slug]).to include("has already been taken")
    end

    it "アカウントタイプが必須であること" do
      account.account_type = nil
      expect(account).to be_invalid
      expect(account.errors[:account_type]).to include("can't be blank")
    end

    it "個人アカウントの場合、オーナーが必須であること" do
      personal = build(:account, :personal, owner: nil)
      expect(personal).to be_invalid
      expect(personal.errors[:owner]).to include("must exist")
    end
  end

  describe "callbacks" do
    it "スラッグが自動的に割り当てられること" do
      account = build(:account, slug: nil)
      account.save!
      expect(account.slug).to be_present
    end

    it "個人アカウントの削除を防止すること" do
      allow(Workspace::ProvisionPersonal).to receive(:call)
      account = create(:account, :personal)

      expect(account.destroy).to be_falsey
      expect(account.errors[:base]).to include("個人用ワークスペースは削除できません。")
      expect(Account.find_by(id: account.id)).to be_present
    end
  end

  describe "associations" do
    it "メンバーシップとメンバーシップを通じたユーザーを持つこと" do
      account = create(:account)
      membership = create(:membership, account:)

      expect(account.memberships).to include(membership)
      expect(account.users).to include(membership.user)
    end

    it "アカウント招待を持つこと" do
      account = create(:account)
      invitation = create(:account_invitation, account:)

      expect(account.account_invitations).to include(invitation)
    end
  end
end
