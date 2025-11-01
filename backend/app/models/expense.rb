# ==============================================
# 支出を管理するモデル
# ==============================================
class Expense < ApplicationRecord
  belongs_to :account
  belongs_to :user

  validates :category, :amount, :spent_on, presence: true
  validates :amount, numericality: { greater_than: 0 }

  scope :for_month, ->(date) { where(spent_on: date.beginning_of_month..date.end_of_month) }
end
