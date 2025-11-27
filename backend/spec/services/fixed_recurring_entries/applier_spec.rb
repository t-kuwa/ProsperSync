require "rails_helper"

RSpec.describe FixedRecurringEntries::Applier do
  let(:account) { create(:account) }
  let(:user) { create(:user) }
  let!(:membership) { create(:membership, :owner, account:, user:) }
  let(:category) { create(:category, :expense, account:) }
  let(:entry) do
    create(
      :fixed_recurring_entry,
      account:,
      category:,
      day_of_month: 10,
      effective_from: Date.new(2025, 1, 1),
      effective_to: Date.new(2025, 1, 1),
    )
  end
  let(:occurrence) do
    create(
      :fixed_recurring_entry_occurrence,
      fixed_recurring_entry: entry,
      period_month: Date.new(2025, 1, 1),
      occurs_on: Date.new(2025, 1, 10),
      status: :scheduled,
    )
  end

  describe ".apply!" do
    it "発生をappliedにし、Expenseを作成して紐付けること" do
      expect do
        described_class.apply!(occurrence:, user:)
      end.to change { Expense.count }.by(1)

      occurrence.reload
      expect(occurrence).to be_applied
      expect(occurrence.expense).to be_present
      expect(occurrence.expense.title).to eq(entry.title)
      expect(occurrence.expense.spent_on).to eq(occurrence.occurs_on)
      expect(occurrence.applied_at).to be_present
    end

    it "income種別の場合はIncomeを作成すること" do
      income_category = create(:category, :income, account:)
      income_entry = create(:fixed_recurring_entry, :income, account:, category: income_category)
      income_occurrence = create(
        :fixed_recurring_entry_occurrence,
        fixed_recurring_entry: income_entry,
        period_month: Date.new(2025, 1, 1),
        occurs_on: Date.new(2025, 1, 5),
      )

      expect do
        described_class.apply!(occurrence: income_occurrence, user:)
      end.to change { Income.count }.by(1)

      expect(income_occurrence.reload.income).to be_present
    end
  end

  describe ".cancel!" do
    it "紐付いたトランザクションを削除し、canceledに更新すること" do
      described_class.apply!(occurrence:, user:)
      expect(occurrence.expense).to be_present

      expect do
        described_class.cancel!(occurrence:)
      end.to change { Expense.count }.by(-1)

      occurrence.reload
      expect(occurrence).to be_canceled
      expect(occurrence.expense).to be_nil
      expect(occurrence.applied_at).to be_nil
    end
  end
end
