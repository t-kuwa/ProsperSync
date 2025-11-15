require "rails_helper"

RSpec.describe BudgetPolicy, type: :policy do
  subject(:policy) { described_class }

  let(:account) { create(:account) }
  let(:member) { create(:user) }
  let!(:membership) { create(:membership, :member, account:, user: member) }
  let(:budget) { create(:budget, account:) }

  permissions :index?, :show?, :create?, :update?, :destroy?, :current? do
    it "permits members of the account" do
      expect(policy).to permit(member, budget)
    end

    it "denies other users" do
      other_user = create(:user)
      expect(policy).not_to permit(other_user, budget)
    end

    it "denies guests" do
      expect(policy).not_to permit(nil, budget)
    end
  end

  describe described_class::Scope do
    subject(:resolved_scope) { described_class::Scope.new(user, Budget.all).resolve }

    let!(:budget_outside) { create(:budget) }

    context "when user is a member" do
      let(:user) { member }

      it "includes budgets for the member's accounts" do
        expect(resolved_scope).to include(budget)
      end

      it "excludes budgets from other accounts" do
        expect(resolved_scope).not_to include(budget_outside)
      end
    end

    context "when user is nil" do
      let(:user) { nil }

      it "returns empty scope" do
        expect(resolved_scope).to be_empty
      end
    end
  end
end
