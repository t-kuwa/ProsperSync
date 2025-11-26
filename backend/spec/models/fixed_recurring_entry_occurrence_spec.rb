require "rails_helper"

RSpec.describe FixedRecurringEntryOccurrence do
  let(:entry) { create(:fixed_recurring_entry, effective_from: Date.new(2025, 1, 1), effective_to: Date.new(2025, 3, 1)) }

  it "同じ月の発生は重複して登録できないこと" do
    create(:fixed_recurring_entry_occurrence, fixed_recurring_entry: entry, period_month: Date.new(2025, 2, 1))

    duplicate = build(:fixed_recurring_entry_occurrence, fixed_recurring_entry: entry, period_month: Date.new(2025, 2, 1))
    expect(duplicate).to be_invalid
    expect(duplicate.errors[:period_month]).to include("は既に登録されています")
  end

  it "period_monthが月初でない場合は無効であること" do
    occurrence = build(
      :fixed_recurring_entry_occurrence,
      fixed_recurring_entry: entry,
      period_month: Date.new(2025, 2, 15),
      occurs_on: Date.new(2025, 2, 15),
    )

    expect(occurrence).to be_invalid
    expect(occurrence.errors[:period_month]).to include("は月初の日付（YYYY-MM-01）を指定してください")
  end

  it "occurs_onがperiod_monthの月外であれば無効であること" do
    occurrence = build(
      :fixed_recurring_entry_occurrence,
      fixed_recurring_entry: entry,
      period_month: Date.new(2025, 2, 1),
      occurs_on: Date.new(2025, 3, 1),
    )

    expect(occurrence).to be_invalid
    expect(occurrence.errors[:occurs_on]).to include("は指定したperiod_monthと同じ月でなければなりません")
  end
end
