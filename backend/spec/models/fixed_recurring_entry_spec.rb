require "rails_helper"

RSpec.describe FixedRecurringEntry do
  let(:account) { create(:account) }
  let(:category) { create(:category, :expense, account:) }

  it "有効な固定収支は保存できること" do
    entry = described_class.new(
      account:,
      category:,
      title: "家賃",
      kind: :expense,
      amount: 80_000,
      day_of_month: 25,
      use_end_of_month: true,
      effective_from: Date.new(2025, 1, 1),
      effective_to: Date.new(2025, 3, 1),
      memo: "メモ",
    )

    expect(entry).to be_valid
  end

  it "月初以外の開始日は無効であること" do
    entry = build(:fixed_recurring_entry, account:, category:, effective_from: Date.new(2025, 1, 5))

    expect(entry).to be_invalid
    expect(entry.errors[:effective_from]).to include("は月初の日付（YYYY-MM-01）を指定してください")
  end

  it "終了日が開始日より前の場合は無効であること" do
    entry = build(
      :fixed_recurring_entry,
      account:,
      category:,
      effective_from: Date.new(2025, 5, 1),
      effective_to: Date.new(2025, 4, 1),
    )

    expect(entry).to be_invalid
    expect(entry.errors[:effective_to]).to include("は開始日以降の日付を指定してください")
  end

  it "use_end_of_monthがfalseのときは29日以上を指定できないこと" do
    entry = build(:fixed_recurring_entry, account:, category:, day_of_month: 30, use_end_of_month: false)

    expect(entry).to be_invalid
    expect(entry.errors[:day_of_month]).to include("は1から28の間で指定してください（29日以上を使用する場合は月末調整を有効にしてください）")
  end

  it "カテゴリがアカウントに属していない場合は無効であること" do
    other_account = create(:account)
    other_category = create(:category, :expense, account: other_account)
    entry = build(:fixed_recurring_entry, account:, category: other_category)

    expect(entry).to be_invalid
    expect(entry.errors[:category]).to include("は指定したアカウントに属していません")
  end
end
