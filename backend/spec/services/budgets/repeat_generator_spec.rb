require "rails_helper"

RSpec.describe Budgets::RepeatGenerator do
  let(:account) { create(:account) }
  let(:category) { create(:category, :expense, account:) }

  describe ".call" do
    context "月次予算の場合" do
      let(:parent_budget) do
        create(
          :budget,
          account:,
          category:,
          period_year: 2025,
          period_month: 11,
          repeat_enabled: true,
          repeat_until_date: Date.new(2026, 2, 28),
        )
      end

      it "繰り返し日付までの各月の子予算を作成すること" do
        expect do
          described_class.call(parent_budget: parent_budget)
        end.to change { parent_budget.child_budgets.count }.by(3)

        months = parent_budget.child_budgets.order(:period_year, :period_month).pluck(:period_month)
        expect(months).to eq([12, 1, 2])
        expect(parent_budget.child_budgets.pluck(:parent_budget_id).uniq).to eq([parent_budget.id])
      end

      it "既に子予算が存在する期間をスキップすること" do
        create(
          :budget,
          account:,
          category:,
          period_year: 2025,
          period_month: 12,
          parent_budget: parent_budget,
        )

        expect do
          described_class.call(parent_budget: parent_budget)
        end.to change { parent_budget.child_budgets.count }.by(2)

        months = parent_budget.child_budgets.order(:period_year, :period_month).pluck(:period_month)
        expect(months).to eq([12, 1, 2])
      end

      it "同じアカウントの無関係な予算をスキップしないこと" do
        create(
          :budget,
          account:,
          category:,
          period_year: 2025,
          period_month: 12,
        )

        expect do
          described_class.call(parent_budget: parent_budget)
        end.to change { parent_budget.child_budgets.count }.by(3)
      end
    end

    context "年間予算の場合" do
      let(:parent_budget) do
        create(
          :budget,
          account:,
          category:,
          period_type: :yearly,
          period_month: nil,
          period_year: 2024,
          repeat_enabled: true,
          repeat_until_date: Date.new(2026, 12, 31),
        )
      end

      it "年間の子予算を生成すること" do
        described_class.call(parent_budget: parent_budget)

        years = parent_budget.child_budgets.order(:period_year).pluck(:period_year)
        expect(years).to eq([2025, 2026])
        expect(parent_budget.child_budgets.pluck(:period_month).uniq).to eq([nil])
      end
    end
  end
end
