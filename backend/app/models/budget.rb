# ==============================================
# アカウントごとの予算を管理するモデル
# ==============================================
class Budget < ApplicationRecord
  belongs_to :account
  belongs_to :category, optional: true
  belongs_to :parent_budget, class_name: "Budget", optional: true
  has_many :child_budgets,
           class_name: "Budget",
           foreign_key: :parent_budget_id,
           dependent: :destroy,
           inverse_of: :parent_budget

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
            },
            if: :root_budget?
  validates :repeat_until_date, presence: true, if: :repeat_enabled?

  validate :category_belongs_to_account
  validate :repeat_until_date_after_period_start

  before_validation :normalize_period_month

  scope :ordered, -> { order(period_year: :desc, period_month: :desc, created_at: :desc) }
  scope :repeating, -> { where(repeat_enabled: true) }
  scope :children_of, ->(parent_id) { where(parent_budget_id: parent_id) }

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

  def repeat_until_date_after_period_start
    return unless repeat_enabled?
    return if repeat_until_date.blank?

    period_end = period.range.end
    return if repeat_until_date > period_end

    errors.add(:repeat_until_date, "は開始期間より後の日付を指定してください")
  rescue ArgumentError
    errors.add(:repeat_until_date, "が不正です")
  end

  def root_budget?
    parent_budget_id.nil?
  end
end
