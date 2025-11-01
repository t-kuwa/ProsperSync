# ==============================================
# ユーザーを管理するモデル
# ==============================================
class User < ApplicationRecord
  has_secure_password

  has_many :accounts, foreign_key: :owner_id, inverse_of: :owner, dependent: :destroy
  has_many :members, dependent: :destroy
  has_many :joined_accounts, through: :members, source: :account
  has_many :expenses, through: :accounts
  has_many :incomes, through: :accounts

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true
end
