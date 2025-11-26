# ==============================================
# 収支のカテゴリを管理するモデル
# ==============================================
class Category < ApplicationRecord
  self.inheritance_column = :_type_disabled

  belongs_to :account

  has_many :expenses, dependent: :restrict_with_error
  has_many :incomes, dependent: :restrict_with_error
  has_many :fixed_recurring_entries, dependent: :restrict_with_error
  has_many :budgets, dependent: :nullify

  enum :type, { expense: 0, income: 1 }

  validates :name, presence: true, length: { maximum: 50 }
  validates :name, uniqueness: { scope: [:account_id, :type] }
  validates :color, format: { with: /\A#[0-9A-Fa-f]{6}\z/, allow_blank: true }

  scope :for_expense, -> { expense }
  scope :for_income, -> { income }
  scope :ordered, -> { order(:position, :name) }
end
