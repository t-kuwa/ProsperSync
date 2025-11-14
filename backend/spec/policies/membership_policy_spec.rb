require "rails_helper"

RSpec.describe MembershipPolicy, type: :policy do
  let(:account) { create(:account) }
  let!(:owner_membership) { create(:membership, :owner, account:) }
  let!(:member_membership) { create(:membership, account:) }

  describe "permissions" do
    context "ユーザーがオーナーの場合" do
      let(:user) { owner_membership.user }
      subject(:policy) { described_class.new(user, member_membership) }

      it "アカウントポリシー経由でのindexを許可すること" do
        expect(AccountPolicy.new(user, account).show?).to be(true)
      end

      it "createを許可すること" do
        new_membership = Membership.new(account: account)
        expect(described_class.new(user, new_membership).create?).to be(true)
      end

      it "updateを許可すること" do
        expect(policy.update?).to be(true)
      end

      it "自身のオーナーメンバーシップでもupdateが許可されること" do
        expect(described_class.new(user, owner_membership).update?).to be(true)
      end

      it "他のメンバーのdestroyを許可すること" do
        expect(policy.destroy?).to be(true)
      end

      context "対象が最後のオーナーの場合" do
        it "自身のオーナーメンバーシップのdestroyを禁止すること" do
          expect(described_class.new(user, owner_membership).destroy?).to be(false)
        end
      end

      context "他にオーナーがいる場合" do
        before do
          create(:membership, :owner, account: account)
        end

        it "自身のオーナーメンバーシップのdestroyを許可すること" do
          expect(described_class.new(user, owner_membership).destroy?).to be(true)
        end
      end
    end

    context "ユーザーが一般メンバーの場合" do
      let(:user) { member_membership.user }

      it "createとupdateを禁止すること" do
        new_membership = Membership.new(account: account)
        policy = described_class.new(user, new_membership)

        expect(policy.create?).to be(false)
        expect(described_class.new(user, member_membership).update?).to be(false)
      end

      it "自身のメンバーシップのdestroyを許可すること" do
        expect(described_class.new(user, member_membership).destroy?).to be(true)
      end

      it "他のメンバーシップのdestroyを禁止すること" do
        expect(described_class.new(user, owner_membership).destroy?).to be(false)
      end
    end

    context "ユーザーがメンバーでない場合" do
      let(:user) { create(:user) }

      it "すべてのアクションを禁止すること" do
        policy = described_class.new(user, member_membership)

        expect(policy.create?).to be(false)
        expect(policy.update?).to be(false)
        expect(policy.destroy?).to be(false)
      end
    end
  end
end
