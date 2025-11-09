# ==============================================
# 支出を管理するモデル
# ==============================================
class Expense < ApplicationRecord
  belongs_to :account
  belongs_to :user
  belongs_to :category

  validates :title, :amount, :spent_on, :category_id, presence: true
  validates :amount, numericality: { greater_than: 0 }

  scope :for_month, ->(date) { where(spent_on: date.beginning_of_month..date.end_of_month) }
end
