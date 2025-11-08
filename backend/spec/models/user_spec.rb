require "rails_helper"

RSpec.describe User, type: :model do
  describe "associations" do
    it "メンバーシップと参加済みアカウントを持つこと" do
      account = create(:account)
      membership = create(:membership, account: account)
      user = membership.user

      expect(user.memberships).to include(membership)
      expect(user.joined_accounts).to include(account)
    end
  end

  describe "#personal_account" do
    it "プライマリアカウントが設定されている場合にそれを返すこと" do
      allow(Workspace::ProvisionPersonal).to receive(:call)
      account = create(:account, :personal)
      user = create(:user, primary_account: account)

      expect(user.personal_account).to eq(account)
    end

    it "最初の個人アカウントにフォールバックすること" do
      allow(Workspace::ProvisionPersonal).to receive(:call)
      user = create(:user, primary_account: nil)
      allow(Workspace::ProvisionPersonal).to receive(:call).and_call_original

      personal = create(:account, :personal, owner: user)
      create(:membership, :owner, account: personal, user: user)

      expect(user.personal_account).to eq(personal)
    end
  end

  describe "callbacks" do
    it "作成後にWorkspace::ProvisionPersonalを呼び出すこと" do
      allow(Workspace::ProvisionPersonal).to receive(:call)

      create(:user)

      expect(Workspace::ProvisionPersonal).to have_received(:call).with(user: instance_of(User))
    end
  end
end
