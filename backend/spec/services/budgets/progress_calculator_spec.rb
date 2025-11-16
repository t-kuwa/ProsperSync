require "rails_helper"

RSpec.describe Budgets::ProgressCalculator, type: :service do
  let(:account) { create(:account) }
  let!(:category_food) { create(:category, :expense, account:, name: "食費") }
  let!(:category_transport) { create(:category, :expense, account:, name: "交通費") }
  let!(:monthly_budget) do
    create(
      :budget,
      account:,
      category: category_food,
      amount: 30_000,
      period_type: :monthly,
      period_year: 2025,
      period_month: 4,
    )
  end
  let!(:yearly_budget) do
    create(
      :budget,
      account:,
      category: nil,
      amount: 360_000,
      period_type: :yearly,
      period_year: 2025,
      name: "年間生活費",
    )
  end

  before do
    create(:expense, account:, category: category_food, amount: 8_000, spent_on: Date.new(2025, 4, 5))
    create(:expense, account:, category: category_food, amount: 12_000, spent_on: Date.new(2025, 4, 20))
    create(:expense, account:, category: category_transport, amount: 15_000, spent_on: Date.new(2025, 2, 10))
  end

  it "指定された予算の進捗メトリクスを返すこと" do
    results = described_class.call(
      account:,
      budgets: [monthly_budget, yearly_budget],
      date: Date.new(2025, 4, 10),
    )

    monthly = results.find { |entry| entry[:budget] == monthly_budget }
    yearly = results.find { |entry| entry[:budget] == yearly_budget }

    expect(monthly[:current_spent]).to eq(20_000)
    expect(monthly[:remaining]).to eq(10_000)
    expect(monthly[:percentage]).to eq(66.7)

    expect(yearly[:current_spent]).to eq(35_000)
    expect(yearly[:remaining]).to eq(325_000)
    expect(yearly[:percentage]).to eq(9.7)
  end
end
