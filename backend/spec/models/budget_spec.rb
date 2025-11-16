require "rails_helper"

RSpec.describe Budget, type: :model do
  let(:account) { create(:account) }
  let!(:category) { create(:category, :expense, account:) }

  it "月次属性で有効であること" do
    budget = described_class.new(
      account:,
      category:,
      amount: 40_000,
      period_type: :monthly,
      period_year: 2025,
      period_month: 5,
      name: "食費予算",
    )

    expect(budget).to be_valid
  end

  it "年間予算の場合、period_monthを正規化すること" do
    budget = described_class.create!(
      account:,
      amount: 120_000,
      period_type: :yearly,
      period_year: 2025,
      name: "年間生活費",
    )

    expect(budget.period_month).to be_nil
    expect(budget.period.yearly?).to be true
  end

  it "アカウント外のカテゴリを拒否すること" do
    other_category = create(:category, :expense)

    budget = described_class.new(
      account:,
      category: other_category,
      amount: 10_000,
      period_type: :monthly,
      period_year: 2025,
      period_month: 1,
    )

    expect(budget).not_to be_valid
    expect(budget.errors[:category_id]).to include("は選択したアカウントに属していません")
  end

  it "同じ期間内での一意性を強制すること" do
    create(
      :budget,
      account:,
      category:,
      amount: 30_000,
      period_type: :monthly,
      period_year: 2025,
      period_month: 4,
    )

    duplicate = build(
      :budget,
      account:,
      category:,
      amount: 20_000,
      period_type: :monthly,
      period_year: 2025,
      period_month: 4,
    )

    expect(duplicate).not_to be_valid
    expect(duplicate.errors[:category_id]).to include("は同じ期間内で一意でなければなりません")
  end
end
