require "rails_helper"

RSpec.describe FixedRecurringEntries::Synchronizer do
  let(:account) { create(:account) }
  let(:category) { create(:category, :expense, account:) }

  describe ".call" do
    let(:entry) do
      create(
        :fixed_recurring_entry,
        account:,
        category:,
        day_of_month: 31,
        use_end_of_month: true,
        effective_from: Date.new(2024, 12, 1),
        effective_to: Date.new(2025, 2, 1),
      )
    end

    it "有効期間内の各月に発生を作成すること" do
      expect do
        described_class.call(entry:)
      end.to change { entry.occurrences.count }.by(3)

      occurs_on = entry.occurrences.order(:period_month).pluck(:occurs_on)
      expect(occurs_on).to eq([Date.new(2024, 12, 31), Date.new(2025, 1, 31), Date.new(2025, 2, 28)])
    end

    it "同じ同期を繰り返しても重複が発生しないこと" do
      described_class.call(entry:)
      expect do
        described_class.call(entry:)
      end.not_to change { entry.occurrences.count }
    end

    it "終了月を延長したときに不足分だけ作成すること" do
      described_class.call(entry:)
      entry.update!(effective_to: Date.new(2025, 4, 1))

      expect do
        described_class.call(entry:)
      end.to change { entry.occurrences.count }.by(2)

      months = entry.occurrences.order(:period_month).pluck(:period_month)
      expect(months).to include(Date.new(2025, 3, 1), Date.new(2025, 4, 1))
    end

    it "終了月を短縮したときに範囲外の発生が削除されること" do
      described_class.call(entry:)
      entry.update!(effective_to: Date.new(2024, 12, 1))

      expect do
        described_class.call(entry:)
      end.to change { entry.occurrences.count }.by(-2)

      months = entry.occurrences.pluck(:period_month)
      expect(months).to eq([Date.new(2024, 12, 1)])
    end

    it "開始月を後ろにずらしたときに前方の発生が削除されること" do
      described_class.call(entry:)
      entry.update!(effective_from: Date.new(2025, 1, 1))

      expect do
        described_class.call(entry:)
      end.to change { entry.occurrences.count }.by(-1)

      months = entry.occurrences.pluck(:period_month)
      expect(months).not_to include(Date.new(2024, 12, 1))
    end

    it "有効範囲外になったapplied発生は削除せずcanceledにすること" do
      described_class.call(entry:)
      dec_occurrence = entry.occurrences.find_by!(period_month: Date.new(2024, 12, 1))
      dec_occurrence.update!(status: :applied, applied_at: Time.zone.now)

      entry.update!(effective_from: Date.new(2025, 1, 1))

      expect do
        described_class.call(entry:)
      end.not_to change { entry.occurrences.count }

      dec_occurrence.reload
      expect(dec_occurrence.status).to eq("canceled")
      expect(dec_occurrence.period_month).to eq(Date.new(2024, 12, 1))
    end

    it "終了日を設定しない場合は現在月から設定値ヶ月先まで作成すること" do
      travel_to(Date.new(2025, 1, 15)) do
        entry.update!(effective_from: Date.new(2024, 12, 1), effective_to: nil)
        allow(FixedRecurringEntries::Config).to receive(:generation_months_ahead).and_return(2)

        described_class.call(entry:)

        months = entry.occurrences.order(:period_month).pluck(:period_month)
        expect(months).to eq(
          [
            Date.new(2024, 12, 1),
            Date.new(2025, 1, 1),
            Date.new(2025, 2, 1),
            Date.new(2025, 3, 1),
          ],
        )
      end
    end
  end
end
