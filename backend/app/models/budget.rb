# ==============================================
# アカウントごとの予算を管理するモデル
# ==============================================
class Budget < ApplicationRecord
  belongs_to :account
  belongs_to :category, optional: true

  enum :period_type, { monthly: 0, yearly: 1 }, default: :monthly

  validates :amount, numericality: { greater_than: 0 }
  validates :period_year,
            presence: true,
            numericality: { greater_than_or_equal_to: 1900 }
  validates :period_month,
            presence: true,
            inclusion: { in: 1..12 },
            if: :monthly?
  validates :category_id,
            uniqueness: {
              scope: %i[account_id period_type period_year period_month],
              message: "は同じ期間内で一意でなければなりません",
            }

  validate :category_belongs_to_account

  before_validation :normalize_period_month

  scope :ordered, -> { order(period_year: :desc, period_month: :desc, created_at: :desc) }

  def period
    Budgets::Period.new(period_type:, year: period_year, month: period_month)
  end

  private

  def normalize_period_month
    self.period_month = nil if yearly?
  end

  def category_belongs_to_account
    return if category_id.blank?
    return if account.categories.where(id: category_id).exists?

    errors.add(:category_id, "は選択したアカウントに属していません")
  end
end
