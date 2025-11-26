# ==============================================
# 固定収支の月次発生を表すモデル
# ==============================================
class FixedRecurringEntryOccurrence < ApplicationRecord
  belongs_to :fixed_recurring_entry

  enum :status, { scheduled: 0, applied: 1, canceled: 2 }

  validates :period_month, presence: true
  validates :occurs_on, presence: true
  validates :period_month,
            uniqueness: {
              scope: :fixed_recurring_entry_id,
              message: "は既に登録されています",
            }
  validate :period_month_on_month_start
  validate :occurs_on_same_month

  scope :for_month, ->(date) { where(period_month: date.beginning_of_month) }

  private

  def period_month_on_month_start
    return if period_month.blank?
    return if period_month.day == 1

    errors.add(:period_month, "は月初の日付（YYYY-MM-01）を指定してください")
  end

  def occurs_on_same_month
    return if period_month.blank? || occurs_on.blank?
    return if occurs_on.beginning_of_month == period_month

    errors.add(:occurs_on, "は指定したperiod_monthと同じ月でなければなりません")
  end
end
