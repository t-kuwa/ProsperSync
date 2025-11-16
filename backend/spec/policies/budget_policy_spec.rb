require "rails_helper"

RSpec.describe BudgetPolicy, type: :policy do
  subject(:policy) { described_class }

  let(:account) { create(:account) }
  let(:member) { create(:user) }
  let!(:membership) { create(:membership, :member, account:, user: member) }
  let(:category) { create(:category, :expense, account:) }
  let(:budget) { create(:budget, account:, category:) }

  permissions :index?, :show?, :create?, :update?, :destroy?, :current? do
    it "アカウントのメンバーを許可すること" do
      expect(policy).to permit(member, budget)
    end

    it "他のユーザーを拒否すること" do
      other_user = create(:user)
      expect(policy).not_to permit(other_user, budget)
    end

    it "ゲストを拒否すること" do
      expect(policy).not_to permit(nil, budget)
    end
  end

  describe described_class::Scope do
    subject(:resolved_scope) { described_class.new(user, Budget.all).resolve }

    let(:other_account) { create(:account) }
    let(:other_category) { create(:category, :expense, account: other_account) }
    let!(:budget_outside) { create(:budget, account: other_account, category: other_category) }

    context "ユーザーがメンバーの場合" do
      let(:user) { member }

      it "メンバーのアカウントの予算を含むこと" do
        expect(resolved_scope).to include(budget)
      end

      it "他のアカウントの予算を除外すること" do
        expect(resolved_scope).not_to include(budget_outside)
      end
    end

    context "ユーザーがnilの場合" do
      let(:user) { nil }

      it "空のスコープを返すこと" do
        expect(resolved_scope).to be_empty
      end
    end
  end
end
