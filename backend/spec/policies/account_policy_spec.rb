require "rails_helper"

RSpec.describe AccountPolicy, type: :policy do
  subject(:policy) { described_class.new(user, account) }

  let(:account) { create(:account) }
  let!(:member_membership) { create(:membership, account:) }
  let(:member_user) { member_membership.user }
  let(:non_member) { create(:user) }

  describe "permissions" do
    context "ユーザーがメンバーの場合" do
      let(:user) { member_user }

      it "indexを許可すること" do
        expect(described_class.new(user, Account).index?).to be(true)
      end

      it "showとupdateを許可すること" do
        expect(policy.show?).to be(true)
        expect(policy.update?).to be(true)
      end

      it "チームアカウントのオーナーによるdestroyを許可すること" do
        member_membership.update!(role: :owner)
        expect(described_class.new(user, account).destroy?).to be(true)
      end

      it "オーナーでないメンバーによるdestroyを禁止すること" do
        expect(policy.destroy?).to be(false)
      end

      it "オーナーによるview_invitations?を許可すること" do
        member_membership.update!(role: :owner)
        expect(policy.view_invitations?).to be(true)
      end

      it "オーナーでないメンバーによるview_invitations?を禁止すること" do
        expect(policy.view_invitations?).to be(false)
      end

      it "個人アカウントでもdestroyはポリシー上許可されること" do
        allow_any_instance_of(User).to receive(:create_personal_workspace!)
        user = create(:user)
        personal = create(:account, :personal, owner: user)
        create(:membership, :owner, account: personal, user: user)

        expect(described_class.new(user, personal).destroy?).to be(true)
      end
    end

    context "ユーザーがメンバーでない場合" do
      let(:user) { non_member }

      it "保護されたアクションを禁止すること" do
        expect(policy.show?).to be(false)
        expect(policy.update?).to be(false)
        expect(policy.destroy?).to be(false)
      end
    end

    context "作成時" do
      it "認証済みユーザーに許可すること" do
        expect(described_class.new(member_user, Account).create?).to be(true)
      end

      it "未認証ユーザーに禁止すること" do
        expect(described_class.new(nil, Account).create?).to be(false)
      end
    end
  end

  describe "Scope" do
    it "ユーザーが所属するアカウントのみを返すこと" do
      member_account = account
      non_member_account = create(:account)
      create(:membership, account: non_member_account)

      scope = described_class::Scope.new(member_user, Account.all).resolve

      expect(scope).to include(member_account)
      expect(scope).not_to include(non_member_account)
    end
  end
end
