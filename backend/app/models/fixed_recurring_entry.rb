# ==============================================
# 固定収支のテンプレートを管理するモデル
# ==============================================
class FixedRecurringEntry < ApplicationRecord
  belongs_to :account
  belongs_to :category

  has_many :occurrences,
           class_name: "FixedRecurringEntryOccurrence",
           dependent: :destroy,
           inverse_of: :fixed_recurring_entry

  enum :kind, { expense: 0, income: 1 }

  validates :title, presence: true
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :day_of_month,
            presence: true,
            numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 31 }
  validates :effective_from, presence: true
  validate :effective_dates_on_month_start
  validate :effective_range_order
  validate :day_of_month_with_end_of_month
  validate :category_belongs_to_account
  validate :category_type_matches_kind

  scope :ordered, -> { order(created_at: :desc) }

  private

  def effective_dates_on_month_start
    if effective_from.present? && effective_from.day != 1
      errors.add(:effective_from, "は月初の日付（YYYY-MM-01）を指定してください")
    end

    if effective_to.present? && effective_to.day != 1
      errors.add(:effective_to, "は月初の日付（YYYY-MM-01）を指定してください")
    end
  end

  def effective_range_order
    return if effective_from.blank? || effective_to.blank?
    return if effective_to >= effective_from

    errors.add(:effective_to, "は開始日以降の日付を指定してください")
  end

  def day_of_month_with_end_of_month
    return if day_of_month.blank?
    return if use_end_of_month? || day_of_month <= 28

    errors.add(:day_of_month, "は1から28の間で指定してください（29日以上を使用する場合は月末調整を有効にしてください）")
  end

  def category_belongs_to_account
    return if account.blank? || category.blank?
    return if category.account_id == account_id

    errors.add(:category, "は指定したアカウントに属していません")
  end

  def category_type_matches_kind
    return if category.blank? || kind.blank?
    return if category.type == kind

    errors.add(:category, "の種別が固定収支の種別と一致していません")
  end
end
