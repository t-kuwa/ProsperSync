require "rails_helper"

RSpec.describe AccountPolicy, type: :policy do
  subject(:policy) { described_class.new(user, account) }

  let(:account) { create(:account) }
  let!(:member_membership) { create(:membership, account:) }
  let(:member_user) { member_membership.user }
  let(:non_member) { create(:user) }

  describe "permissions" do
    context "when user is a member" do
      let(:user) { member_user }

      it "allows index" do
        expect(described_class.new(user, Account).index?).to be(true)
      end

      it "allows show and update" do
        expect(policy.show?).to be(true)
        expect(policy.update?).to be(true)
      end

      it "allows destroy for owners when team" do
        member_membership.update!(role: :owner)
        expect(described_class.new(user, account).destroy?).to be(true)
      end

      it "forbids destroy for non owners" do
        expect(policy.destroy?).to be(false)
      end

      it "forbids destroy for personal accounts" do
        allow_any_instance_of(User).to receive(:create_personal_workspace!)
        user = create(:user)
        personal = create(:account, :personal, owner: user)
        create(:membership, :owner, account: personal, user: user)

        expect(described_class.new(user, personal).destroy?).to be(false)
      end
    end

    context "when user is not a member" do
      let(:user) { non_member }

      it "forbids protected actions" do
        expect(policy.show?).to be(false)
        expect(policy.update?).to be(false)
        expect(policy.destroy?).to be(false)
      end
    end

    context "when creating" do
      it "allows authenticated users" do
        expect(described_class.new(member_user, Account).create?).to be(true)
      end

      it "forbids unauthenticated users" do
        expect(described_class.new(nil, Account).create?).to be(false)
      end
    end
  end

  describe "Scope" do
    it "returns only accounts the user belongs to" do
      member_account = account
      non_member_account = create(:account)
      create(:membership, account: non_member_account)

      scope = described_class::Scope.new(member_user, Account.all).resolve

      expect(scope).to include(member_account)
      expect(scope).not_to include(non_member_account)
    end
  end
end
